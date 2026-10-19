import tempfile
import unittest
from contextlib import closing
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from fastapi import HTTPException

from backend import api


def cstring(value):
    return value.encode("utf-8") + b"\0"


class A2STests(unittest.TestCase):
    def test_parse_server_info(self):
        packet = (
            b"\xff\xff\xff\xffI\x11"
            + cstring("Kasiheim")
            + cstring("Kasiheim_World")
            + cstring("valheim")
            + cstring("Valheim")
            + b"\x4a\x22"
            + bytes([2, 10, 0, ord("d"), ord("l"), 0, 0])
            + cstring("0.219.16")
        )

        self.assertEqual(
            api.parse_a2s_info(packet),
            {
                "server_name": "Kasiheim",
                "map": "Kasiheim_World",
                "player_count": 2,
                "max_players": 10,
                "version": "0.219.16",
            },
        )

    def test_parse_player_names(self):
        packet = (
            b"\xff\xff\xff\xffD\x02"
            + b"\x00"
            + cstring("Kasiri_Jarl")
            + b"\x00" * 8
            + b"\x01"
            + cstring("Valkyrie_Thor")
            + b"\x00" * 8
        )

        self.assertEqual(api.parse_a2s_player_names(packet), ["Kasiri_Jarl", "Valkyrie_Thor"])

    def test_parse_player_names_ignores_empty_names(self):
        packet = b"\xff\xff\xff\xffD\x01" + b"\x00" + cstring("") + b"\x00" * 8

        self.assertEqual(api.parse_a2s_player_names(packet), [])

    def test_reject_truncated_server_info(self):
        with self.assertRaises(ValueError):
            api.parse_a2s_info(b"\xff\xff\xff\xffI\x11")

    def test_process_match_uses_the_configured_game_port(self):
        process_2456 = (
            b"/home/amp/Valheim/valheim_server.x86_64\0-name\0Old\0-port\0"
            + b"2456\0-world\0OldWorld\0"
        )
        process_2458 = (
            b"/home/amp/Valheim/valheim_server.x86_64\0-name\0Kasiheim\0-port\0"
            + b"2458\0-world\0KasiheimWorld\0"
        )

        self.assertIsNone(api.parse_valheim_cmdline(process_2456, 2458))
        self.assertEqual(
            api.parse_valheim_cmdline(process_2458, 2458),
            {"name": "Kasiheim", "world": "KasiheimWorld"},
        )

    def test_amp_default_metadata_is_not_treated_as_real_server_details(self):
        process_2458 = (
            b"/home/amp/Valheim/valheim_server.x86_64\0-name\0My Valheim Server - Powered by AMP\0-port\0"
            + b"2458\0-world\0PoweredByAMP\0"
        )

        self.assertEqual(
            api.parse_valheim_cmdline(process_2458, 2458),
            {"name": "My Valheim Server - Powered by AMP", "world": "PoweredByAMP"},
        )
        self.assertIsNone(api._meaningful_server_value("My Valheim Server - Powered by AMP"))
        self.assertIsNone(api._meaningful_server_value("My Valheim Server - Powered by"))
        self.assertIsNone(api._meaningful_server_value("PoweredByAMP"))
        self.assertIsNone(api._meaningful_server_value("1.0.0.0"))


class AdminAndStorageTests(unittest.TestCase):
    def test_password_hash_verifies_and_rejects_other_password(self):
        encoded = api.hash_password("a long test password")

        self.assertTrue(api.verify_password("a long test password", encoded))
        self.assertFalse(api.verify_password("another password", encoded))
        self.assertFalse(api.verify_password("a long test password", "invalid"))

    def test_database_cascades_boss_records_when_participant_is_deleted(self):
        with tempfile.TemporaryDirectory() as directory:
            database_path = Path(directory) / "test.sqlite3"
            with patch.object(api, "DATABASE_PATH", database_path):
                api.initialize_database()
                with closing(api._open_database()) as connection:
                    with connection:
                        cursor = connection.execute(
                            "INSERT INTO participants (name, type) VALUES (?, ?)",
                            ("Kasiri_Jarl", "player"),
                        )
                        connection.execute(
                            "INSERT INTO boss_defeats (participant_id, boss_id, defeated_at) VALUES (?, ?, ?)",
                            (cursor.lastrowid, "eikthyr", "2026-10-19"),
                        )
                        connection.execute("DELETE FROM participants WHERE id = ?", (cursor.lastrowid,))
                        remaining = connection.execute("SELECT COUNT(*) FROM boss_defeats").fetchone()[0]
                self.assertEqual(remaining, 0)

    def test_admin_can_save_progress_but_raw_token_is_not_stored(self):
        with tempfile.TemporaryDirectory() as directory:
            database_path = Path(directory) / "test.sqlite3"
            with patch.object(api, "DATABASE_PATH", database_path):
                api.initialize_database()
                with closing(api._open_database()) as connection, connection:
                    with patch.dict(
                        "os.environ",
                        {
                            "ADMIN_USERNAME": "owner",
                            "ADMIN_PASSWORD_HASH": api.hash_password("a secure test password"),
                        },
                    ):
                        login = api.admin_login(
                            api.LoginRequest(username="owner", password="a secure test password"),
                            SimpleNamespace(client=SimpleNamespace(host="127.0.0.1")),
                            connection,
                        )

                    token_hash = api._admin_session(f"Bearer {login['access_token']}", connection)
                    stored_session = connection.execute("SELECT token_hash FROM admin_sessions").fetchone()[0]
                    self.assertNotEqual(stored_session, login["access_token"])

                    participant = api.create_participant(
                        api.ParticipantRequest(name="Kasiri_Jarl", type="player"),
                        token_hash,
                        connection,
                    )
                    api.set_boss_defeat(
                        participant["id"],
                        "eikthyr",
                        api.BossDefeatRequest(defeated=True),
                        token_hash,
                        connection,
                    )

                    result = api.get_progress(connection)
                    self.assertEqual(result["participants"][0]["name"], "Kasiri_Jarl")
                    self.assertEqual(result["participants"][0]["bosses"][0]["boss_id"], "eikthyr")

                    with self.assertRaises(HTTPException) as unauthorized:
                        api._admin_session(None, connection)
                    self.assertEqual(unauthorized.exception.status_code, 401)

    def test_failed_logins_are_rate_limited(self):
        with tempfile.TemporaryDirectory() as directory:
            database_path = Path(directory) / "test.sqlite3"
            with patch.object(api, "DATABASE_PATH", database_path):
                api.initialize_database()
                with closing(api._open_database()) as connection, connection:
                    request = SimpleNamespace(client=SimpleNamespace(host="192.0.2.1"))
                    with patch.dict(
                        "os.environ",
                        {
                            "ADMIN_USERNAME": "owner",
                            "ADMIN_PASSWORD_HASH": api.hash_password("a secure test password"),
                        },
                    ):
                        for _ in range(5):
                            with self.assertRaises(HTTPException) as unauthorized:
                                api.admin_login(
                                    api.LoginRequest(username="owner", password="wrong password"),
                                    request,
                                    connection,
                                )
                            self.assertEqual(unauthorized.exception.status_code, 401)

                        with self.assertRaises(HTTPException) as locked:
                            api.admin_login(
                                api.LoginRequest(username="owner", password="a secure test password"),
                                request,
                                connection,
                            )
                        self.assertEqual(locked.exception.status_code, 429)


class StatusTests(unittest.TestCase):
    def test_offline_server_does_not_report_stale_players(self):
        with patch.object(api, "find_valheim_process", return_value=None):
            result = api.get_server_status()

        self.assertFalse(result["online"])
        self.assertFalse(result["process_running"])
        self.assertIsNone(result["players"])
        self.assertIsNone(result["player_count"])

    def test_status_uses_live_a2s_fields_for_the_matching_process(self):
        with (
            patch.object(api, "find_valheim_process", return_value={"world": "KasiheimWorld"}),
            patch.object(
                api,
                "query_server_info",
                return_value=(
                    {
                        "server_name": "Kasiheim",
                        "map": "KasiheimWorld",
                        "version": "0.219.16",
                        "player_count": 2,
                        "max_players": 10,
                    },
                    31.4,
                ),
            ),
            patch.object(api, "query_player_names", return_value=["Kasiri_Jarl", "Valkyrie_Thor"]),
        ):
            result = api.get_server_status()

        self.assertTrue(result["online"])
        self.assertEqual(result["world"], "KasiheimWorld")
        self.assertEqual(result["ping_ms"], 31.4)
        self.assertEqual(result["version"], "0.219.16")
        self.assertEqual(result["players"], ["Kasiri_Jarl", "Valkyrie_Thor"])

    def test_status_does_not_report_blank_names_as_connected_players(self):
        with (
            patch.object(api, "find_valheim_process", return_value={"world": "KasiheimWorld"}),
            patch.object(
                api,
                "query_server_info",
                return_value=(
                    {
                        "server_name": "Kasiheim",
                        "map": "KasiheimWorld",
                        "version": "0.219.16",
                        "player_count": 1,
                        "max_players": 10,
                    },
                    18.5,
                ),
            ),
            patch.object(api, "query_player_names", return_value=[""]),
        ):
            result = api.get_server_status()

        self.assertEqual(result["player_count"], 1)
        self.assertIsNone(result["players"])

    def test_status_omits_amp_default_metadata(self):
        with (
            patch.object(
                api,
                "find_valheim_process",
                return_value={"name": "My Valheim Server - Powered by AMP", "world": "PoweredByAMP"},
            ),
            patch.object(
                api,
                "query_server_info",
                return_value=(
                    {
                        "server_name": "My Valheim Server - Powered by AMP",
                        "map": "PoweredByAMP",
                        "version": "1.0.0.0",
                        "player_count": 0,
                        "max_players": 10,
                    },
                    12.2,
                ),
            ),
        ):
            result = api.get_server_status()

        self.assertTrue(result["online"])
        self.assertTrue(result["process_running"])
        self.assertIsNone(result["server_name"])
        self.assertIsNone(result["world"])
        self.assertIsNone(result["version"])
        self.assertEqual(result["player_count"], 0)
        self.assertEqual(result["players"], [])


if __name__ == "__main__":
    unittest.main()
