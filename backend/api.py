import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import socket
import sqlite3
import time
from contextlib import asynccontextmanager, closing
from datetime import date, datetime, timezone
from pathlib import Path
from typing import Literal

from fastapi import Depends, FastAPI, Header, HTTPException, Request, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kasiheim.api")

SERVER_PORT = int(os.getenv("VALHEIM_PORT", "2458"))
QUERY_PORT = int(os.getenv("VALHEIM_QUERY_PORT", str(SERVER_PORT + 1)))
QUERY_HOST = os.getenv("VALHEIM_QUERY_HOST", "127.0.0.1")
MAX_PLAYERS = int(os.getenv("VALHEIM_MAX_PLAYERS", "10"))
PLAYER_SNAPSHOT_FILE = Path(
    os.getenv(
        "KASIHEIM_PLAYERS_FILE",
        "/home/amp/valheim-stats/server_players.json",
    )
)
PLAYER_SNAPSHOT_MAX_AGE_SECONDS = 30
DATABASE_PATH = Path(os.getenv("KASIHEIM_DATABASE", str(Path(__file__).with_name("kasiheim.sqlite3"))))
ADMIN_SESSION_SECONDS = 8 * 60 * 60
PASSWORD_HASH_ITERATIONS = 310_000
VALID_BOSS_IDS = {
    "eikthyr",
    "el_sabio",
    "bonemass",
    "moder",
    "yagluth",
    "la_reina",
    "fader",
}
GENERIC_SERVER_VALUES = {
    "my valheim server - powered by amp",
    "poweredbyamp",
    "1.0.0.0",
}


def _open_database():
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(DATABASE_PATH)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection


def initialize_database():
    with closing(_open_database()) as connection:
        connection.executescript(
            """
            CREATE TABLE IF NOT EXISTS participants (
                id INTEGER PRIMARY KEY,
                name TEXT NOT NULL COLLATE NOCASE,
                type TEXT NOT NULL CHECK (type IN ('player', 'clan')),
                UNIQUE (name, type)
            );
            CREATE TABLE IF NOT EXISTS boss_defeats (
                participant_id INTEGER NOT NULL REFERENCES participants(id) ON DELETE CASCADE,
                boss_id TEXT NOT NULL,
                defeated_at TEXT NOT NULL,
                PRIMARY KEY (participant_id, boss_id)
            );
            CREATE TABLE IF NOT EXISTS admin_sessions (
                token_hash TEXT PRIMARY KEY,
                expires_at INTEGER NOT NULL
            );
            CREATE TABLE IF NOT EXISTS login_attempts (
                remote_address TEXT PRIMARY KEY,
                failures INTEGER NOT NULL,
                locked_until INTEGER NOT NULL
            );
            """
        )


@asynccontextmanager
async def lifespan(_app):
    initialize_database()
    yield


app = FastAPI(title="Kasiheim API", lifespan=lifespan)
allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ORIGINS",
        "https://kasiri.github.io,https://kasiheim.site",
    ).split(",")
    if origin.strip()
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


def get_connection():
    connection = _open_database()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()


def hash_password(password: str, salt: bytes | None = None) -> str:
    if len(password) < 12:
        raise ValueError("La contraseña debe tener al menos 12 caracteres.")
    salt = salt or secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, PASSWORD_HASH_ITERATIONS)
    salt_text = base64.urlsafe_b64encode(salt).decode("ascii").rstrip("=")
    digest_text = base64.urlsafe_b64encode(digest).decode("ascii").rstrip("=")
    return f"pbkdf2_sha256${PASSWORD_HASH_ITERATIONS}${salt_text}${digest_text}"


def verify_password(password: str, encoded_hash: str) -> bool:
    try:
        algorithm, iterations_text, salt_text, expected_text = encoded_hash.split("$")
        if algorithm != "pbkdf2_sha256":
            return False
        iterations = int(iterations_text)
        if iterations < 100_000 or iterations > 2_000_000:
            return False
        salt = base64.urlsafe_b64decode(salt_text + "=" * (-len(salt_text) % 4))
        expected = base64.urlsafe_b64decode(expected_text + "=" * (-len(expected_text) % 4))
    except (ValueError, TypeError):
        return False

    actual = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(actual, expected)


def _read_cstring(packet: bytes, offset: int) -> tuple[str, int]:
    end = packet.find(b"\0", offset)
    if end < 0:
        raise ValueError("Respuesta A2S incompleta: cadena sin terminador.")
    return packet[offset:end].decode("utf-8", errors="replace"), end + 1


def parse_a2s_info(packet: bytes) -> dict:
    if len(packet) < 5 or packet[:4] != b"\xff\xff\xff\xff" or packet[4] != 0x49:
        raise ValueError("Respuesta A2S_INFO no válida.")

    offset = 6
    name, offset = _read_cstring(packet, offset)
    world, offset = _read_cstring(packet, offset)
    _, offset = _read_cstring(packet, offset)
    _, offset = _read_cstring(packet, offset)

    if offset + 9 > len(packet):
        raise ValueError("Respuesta A2S_INFO truncada.")

    offset += 2
    player_count, max_players = packet[offset], packet[offset + 1]
    offset += 7
    version, _ = _read_cstring(packet, offset)
    return {
        "server_name": name,
        "map": world,
        "player_count": player_count,
        "max_players": max_players,
        "version": version,
    }


def _send_a2s_query(sock: socket.socket, address: tuple[str, int], payload: bytes) -> tuple[bytes, float]:
    started = time.monotonic()
    sock.sendto(payload, address)
    packet, _ = sock.recvfrom(4096)
    if len(packet) >= 9 and packet[:5] == b"\xff\xff\xff\xffA":
        challenge = packet[5:9]
        started = time.monotonic()
        sock.sendto(payload + challenge, address)
        packet, _ = sock.recvfrom(4096)
    return packet, (time.monotonic() - started) * 1000


def query_server_info() -> tuple[dict, float]:
    address = (QUERY_HOST, QUERY_PORT)
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(1.5)
        packet, ping_ms = _send_a2s_query(
            sock,
            address,
            b"\xff\xff\xff\xffTSource Engine Query\0",
        )
    return parse_a2s_info(packet), ping_ms


def query_player_names() -> list[str]:
    address = (QUERY_HOST, QUERY_PORT)
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as sock:
        sock.settimeout(1.5)
        packet, _ = _send_a2s_query(sock, address, b"\xff\xff\xff\xffU\xff\xff\xff\xff")

    if len(packet) < 6 or packet[:5] != b"\xff\xff\xff\xffD":
        raise ValueError("Respuesta A2S_PLAYER no válida.")
    return parse_a2s_player_names(packet)


def parse_a2s_player_names(packet: bytes) -> list[str]:
    if len(packet) < 6 or packet[:5] != b"\xff\xff\xff\xffD":
        raise ValueError("Respuesta A2S_PLAYER no válida.")
    count = packet[5]
    offset = 6
    players = []
    for _ in range(count):
        if offset >= len(packet):
            raise ValueError("Respuesta A2S_PLAYER truncada.")
        offset += 1
        name, offset = _read_cstring(packet, offset)
        if offset + 8 > len(packet):
            raise ValueError("Respuesta A2S_PLAYER truncada.")
        offset += 8
        if name.strip():
            players.append(name.strip())
    return players


def read_plugin_player_names(expected_count: int) -> list[str] | None:
    try:
        with PLAYER_SNAPSHOT_FILE.open("r", encoding="utf-8") as snapshot_file:
            snapshot = json.load(snapshot_file)
    except FileNotFoundError:
        return None
    except (OSError, UnicodeError, json.JSONDecodeError) as error:
        logger.warning("No se pudo leer la lista de jugadores de BepInEx: %s", error)
        return None

    if not isinstance(snapshot, dict) or not isinstance(snapshot.get("updated_at"), str):
        logger.warning("El archivo de jugadores de BepInEx tiene un formato no válido.")
        return None
    raw_players = snapshot.get("players")
    if not isinstance(raw_players, list) or any(not isinstance(name, str) or not name.strip() for name in raw_players):
        logger.warning("El archivo de jugadores de BepInEx contiene una lista no válida.")
        return None

    updated_at_text = snapshot["updated_at"]
    if updated_at_text.endswith("Z"):
        updated_at_text = updated_at_text[:-1] + "+00:00"
    try:
        updated_at = datetime.fromisoformat(updated_at_text)
    except ValueError:
        logger.warning("El archivo de jugadores de BepInEx tiene una fecha no válida.")
        return None
    if updated_at.tzinfo is None:
        logger.warning("La fecha del archivo de jugadores de BepInEx no tiene zona horaria.")
        return None

    age_seconds = (datetime.now(timezone.utc) - updated_at.astimezone(timezone.utc)).total_seconds()
    if age_seconds < -5 or age_seconds > PLAYER_SNAPSHOT_MAX_AGE_SECONDS:
        logger.info("La lista de jugadores de BepInEx está obsoleta o tiene una fecha futura.")
        return None

    players = [name.strip() for name in raw_players]
    if len(players) != expected_count:
        logger.info(
            "A2S_INFO informa %s jugadores, pero el complemento BepInEx informa %s nombres.",
            expected_count,
            len(players),
        )
        return None
    return players


def parse_valheim_cmdline(command_line: bytes, port: int = SERVER_PORT) -> dict | None:
    arguments = command_line.split(b"\0")
    if not arguments or not arguments[0]:
        return None
    executable = Path(arguments[0].decode("utf-8", errors="replace")).name
    if executable != "valheim_server.x86_64":
        return None

    options = {}
    for index, argument in enumerate(arguments[:-1]):
        if argument in (b"-port", b"-name", b"-world"):
            options[argument.decode("ascii")] = arguments[index + 1].decode("utf-8", errors="replace")
    if options.get("-port") == str(port):
        return {"name": options.get("-name"), "world": options.get("-world")}
    return None


def _meaningful_server_value(value: str | None) -> str | None:
    if not value:
        return None
    normalized = value.strip().casefold()
    if normalized in GENERIC_SERVER_VALUES or normalized.startswith("my valheim server - powered by"):
        return None
    return value.strip()


def find_valheim_process(port: int = SERVER_PORT) -> dict | None:
    for process_dir in Path("/proc").iterdir():
        if not process_dir.name.isdigit():
            continue
        try:
            command_line = (process_dir / "cmdline").read_bytes()
        except OSError:
            continue
        process = parse_valheim_cmdline(command_line, port)
        if process:
            return process
    return None


def get_server_status() -> dict:
    updated_at = datetime.now(timezone.utc).isoformat()
    process = find_valheim_process()
    result = {
        "online": False,
        "process_running": process is not None,
        "server_name": _meaningful_server_value(process.get("name")) if process else None,
        "world": _meaningful_server_value(process.get("world")) if process else None,
        "version": None,
        "ping_ms": None,
        "max_players": MAX_PLAYERS,
        "player_count": None,
        "players": None,
        "updated_at": updated_at,
    }
    if not process:
        return result

    try:
        info, ping_ms = query_server_info()
    except (OSError, ValueError) as error:
        logger.info("El proceso Valheim está presente, pero no responde a A2S: %s", error)
        return result

    result.update(
        online=True,
        server_name=result["server_name"] or _meaningful_server_value(info["server_name"]),
        world=result["world"] or _meaningful_server_value(info["map"]),
        version=_meaningful_server_value(info["version"]),
        ping_ms=round(ping_ms, 1),
        max_players=info["max_players"] or MAX_PLAYERS,
        player_count=info["player_count"],
    )
    if info["player_count"] == 0:
        result["players"] = []
    else:
        try:
            players = [name.strip() for name in query_player_names() if name.strip()]
            if len(players) == info["player_count"]:
                result["players"] = players
            else:
                logger.info(
                    "A2S_INFO informa %s jugadores, pero A2S_PLAYER devolvió %s nombres.",
                    info["player_count"],
                    len(players),
                )
        except (OSError, ValueError) as error:
            logger.info("No se pudo consultar la lista A2S_PLAYER: %s", error)
        if result["players"] is None:
            result["players"] = read_plugin_player_names(info["player_count"])
    return result


@app.get("/api/status")
def server_status():
    return get_server_status()


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=64)
    password: str = Field(min_length=1, max_length=256)


class ParticipantRequest(BaseModel):
    name: str = Field(min_length=1, max_length=64)
    type: Literal["player", "clan"]


class BossDefeatRequest(BaseModel):
    defeated: bool


def _admin_session(authorization: str | None, connection: sqlite3.Connection) -> str:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Inicia sesión como administrador.")
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sesión no válida.")
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    session = connection.execute(
        "SELECT expires_at FROM admin_sessions WHERE token_hash = ?",
        (token_hash,),
    ).fetchone()
    if not session or session["expires_at"] <= int(time.time()):
        if session:
            connection.execute("DELETE FROM admin_sessions WHERE token_hash = ?", (token_hash,))
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="La sesión ha caducado. Vuelve a iniciar sesión.")
    return token_hash


def require_admin(
    authorization: str | None = Header(default=None),
    connection: sqlite3.Connection = Depends(get_connection),
) -> str:
    return _admin_session(authorization, connection)


@app.post("/api/admin/login")
def admin_login(data: LoginRequest, request: Request, connection: sqlite3.Connection = Depends(get_connection)):
    username = os.getenv("ADMIN_USERNAME", "")
    encoded_hash = os.getenv("ADMIN_PASSWORD_HASH", "")
    if not username or not encoded_hash:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail="El acceso de administrador aún no está configurado.")

    remote_address = request.client.host if request.client else "unknown"
    now = int(time.time())
    attempts = connection.execute(
        "SELECT failures, locked_until FROM login_attempts WHERE remote_address = ?",
        (remote_address,),
    ).fetchone()
    if attempts and attempts["locked_until"] > now:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Demasiados intentos. Espera 15 minutos.")

    valid_username = hmac.compare_digest(data.username.encode("utf-8"), username.encode("utf-8"))
    valid_password = verify_password(data.password, encoded_hash)
    if not (valid_username and valid_password):
        failures = attempts["failures"] + 1 if attempts and attempts["locked_until"] <= now else 1
        locked_until = now + 900 if failures >= 5 else 0
        connection.execute(
            """
            INSERT INTO login_attempts (remote_address, failures, locked_until)
            VALUES (?, ?, ?)
            ON CONFLICT(remote_address) DO UPDATE SET
                failures = excluded.failures,
                locked_until = excluded.locked_until
            """,
            (remote_address, failures, locked_until),
        )
        connection.commit()
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Usuario o contraseña incorrectos.")

    connection.execute("DELETE FROM login_attempts WHERE remote_address = ?", (remote_address,))
    token = secrets.token_urlsafe(32)
    token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
    connection.execute(
        "INSERT INTO admin_sessions (token_hash, expires_at) VALUES (?, ?)",
        (token_hash, now + ADMIN_SESSION_SECONDS),
    )
    return {"access_token": token, "token_type": "bearer", "expires_in": ADMIN_SESSION_SECONDS}


@app.post("/api/admin/logout")
def admin_logout(
    authorization: str | None = Header(default=None),
    token_hash: str = Depends(require_admin),
    connection: sqlite3.Connection = Depends(get_connection),
):
    del authorization
    connection.execute("DELETE FROM admin_sessions WHERE token_hash = ?", (token_hash,))
    return {"ok": True}


@app.get("/api/progress")
def get_progress(connection: sqlite3.Connection = Depends(get_connection)):
    participants = connection.execute(
        "SELECT id, name, type FROM participants ORDER BY type, name COLLATE NOCASE"
    ).fetchall()
    defeats = connection.execute(
        "SELECT participant_id, boss_id, defeated_at FROM boss_defeats ORDER BY defeated_at"
    ).fetchall()
    by_participant: dict[int, list[dict]] = {}
    for defeat in defeats:
        by_participant.setdefault(defeat["participant_id"], []).append(
            {"boss_id": defeat["boss_id"], "defeated_at": defeat["defeated_at"]}
        )
    return {
        "participants": [
            {
                "id": participant["id"],
                "name": participant["name"],
                "type": participant["type"],
                "bosses": by_participant.get(participant["id"], []),
            }
            for participant in participants
        ]
    }


@app.post("/api/admin/participants", status_code=status.HTTP_201_CREATED)
def create_participant(
    data: ParticipantRequest,
    _admin: str = Depends(require_admin),
    connection: sqlite3.Connection = Depends(get_connection),
):
    name = data.name.strip()
    if not name:
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="El nombre no puede estar vacío.")
    try:
        cursor = connection.execute(
            "INSERT INTO participants (name, type) VALUES (?, ?)",
            (name, data.type),
        )
    except sqlite3.IntegrityError as error:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Ya existe un registro con ese nombre y tipo.") from error
    return {"id": cursor.lastrowid, "name": name, "type": data.type, "bosses": []}


@app.delete("/api/admin/participants/{participant_id}")
def delete_participant(
    participant_id: int,
    _admin: str = Depends(require_admin),
    connection: sqlite3.Connection = Depends(get_connection),
):
    cursor = connection.execute("DELETE FROM participants WHERE id = ?", (participant_id,))
    if cursor.rowcount == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el jugador o clan.")
    return {"ok": True}


@app.put("/api/admin/participants/{participant_id}/bosses/{boss_id}")
def set_boss_defeat(
    participant_id: int,
    boss_id: str,
    data: BossDefeatRequest,
    _admin: str = Depends(require_admin),
    connection: sqlite3.Connection = Depends(get_connection),
):
    if boss_id not in VALID_BOSS_IDS:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se reconoce ese jefe.")
    exists = connection.execute("SELECT 1 FROM participants WHERE id = ?", (participant_id,)).fetchone()
    if not exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No se encontró el jugador o clan.")
    if data.defeated:
        connection.execute(
            """
            INSERT INTO boss_defeats (participant_id, boss_id, defeated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(participant_id, boss_id) DO NOTHING
            """,
            (participant_id, boss_id, date.today().isoformat()),
        )
    else:
        connection.execute(
            "DELETE FROM boss_defeats WHERE participant_id = ? AND boss_id = ?",
            (participant_id, boss_id),
        )
    return {"ok": True}


if __name__ == "__main__":
    import getpass

    print(hash_password(getpass.getpass("Contraseña de administrador: ")))
