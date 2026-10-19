# Kasiheim Web

Web de la comunidad Kasiheim, organizada en páginas React y alimentada por una API FastAPI independiente.

## Desarrollo

```bash
npm install
npm run dev
```

La web consulta por defecto `https://kasiheim.site`. Para usar otro backend en desarrollo, crea `.env.local` con `VITE_API_BASE_URL=https://tu-api.example` (sin `/api` al final).

## Estructura

- `src/pages/`: dashboard, progreso de jefes, normas, mods, galería y FAQ.
- `src/components/`: componentes reutilizables de interfaz.
- `src/data/content.js`: contenido estático de la comunidad y catálogo de jefes.
- `src/lib/api.js`: comunicación HTTP con FastAPI.
- `backend/api.py`: API, consultas del servidor de juego, autenticación de administrador y persistencia SQLite.

## Estado del servidor

La API comprueba el proceso Valheim que utiliza `VALHEIM_PORT` y consulta el protocolo de servidor A2S por UDP. El ping mostrado es el RTT de la consulta desde el VPS al servidor; no es la latencia individual de cada jugador. La lista de nombres depende de que el servidor responda a `A2S_PLAYER`; si no lo hace, la interfaz informa que no están disponibles en lugar de inventarlos. Se descartan los metadatos genéricos que AMP informa por defecto (`PoweredByAMP`, `My Valheim Server - Powered by AMP` y `1.0.0.0`) para no presentarlos como datos reales.

La configuración por defecto consulta el proceso del puerto `2458` y hace A2S en `127.0.0.1:2459`. Si AMP usa otro puerto de consulta, configura `VALHEIM_QUERY_PORT`. El estado se actualiza cada 10 segundos.

### Nombres de jugadores con BepInEx

Si A2S informa el número de jugadores pero no sus nombres, el complemento opcional `backend/valheim-plugin` escribe cada cinco segundos una instantánea local a `/home/amp/.ampdata/instances/Kasiheimmods01/Valheim/896660/BepInEx/config/kasiheim_players.json`. La API solo la acepta si tiene menos de 30 segundos y el número de nombres coincide con el contador A2S; si no, mantiene los nombres como no disponibles. El archivo contiene nombres visibles del juego y la API ya los publica, así que debe permanecer local al VPS.

Compila desde una copia del repositorio en el VPS. Ajusta `VALHEIM_ROOT` si la carpeta de la instancia es diferente:

```bash
VALHEIM_ROOT="/home/amp/.ampdata/instances/Kasiheimmods01/Valheim/896660"
dotnet build backend/valheim-plugin/KasiheimPlayers.csproj -c Release \
  -p:ValheimManagedDir="$VALHEIM_ROOT/valheim_server_Data/Managed" \
  -p:BepInExCoreDir="$VALHEIM_ROOT/BepInEx/core"
install -m 644 backend/valheim-plugin/bin/Release/netstandard2.1/KasiheimPlayers.dll \
  "$VALHEIM_ROOT/BepInEx/plugins/KasiheimPlayers.dll"
```

La cuenta del servidor escribe el archivo en su carpeta de configuración de BepInEx; comprueba que la cuenta de Uvicorn puede leerlo. Si la ruta de la instancia es distinta, configura `KASIHEIM_PLAYERS_FILE` en `api.env` y `General.OutputFile` en `BepInEx/config/KasiheimPlayers.cfg` con la misma ruta. Reinicia solo la instancia Valheim del puerto `2458` desde AMP para cargar el complemento y reinicia Uvicorn si cambiaste `api.env`. Comprueba que el JSON se actualiza al conectar y desconectar jugadores y que la API devuelve sus nombres.

## API y despliegue del backend

El backend necesita Python 3.10 o posterior y los paquetes de `backend/requirements.txt`. En el VPS, coloca `backend/api.py` como `/home/amp/valheim-stats/api.py`; conserva el resto de archivos de la instalación existente.

Genera un hash de contraseña sin escribir la contraseña en el historial de shell:

```bash
cd /home/amp/valheim-stats
./venv/bin/python api.py
```

El programa solicita la contraseña de forma oculta e imprime un hash PBKDF2 (mínimo 12 caracteres). Configura el entorno del proceso Uvicorn con:

- `ADMIN_USERNAME`: nombre de la única cuenta administradora.
- `ADMIN_PASSWORD_HASH`: hash generado arriba.
- `VALHEIM_PORT=2458`
- `VALHEIM_QUERY_PORT=2459` (ajustar al puerto A2S real de AMP).
- `VALHEIM_QUERY_HOST=127.0.0.1`
- `CORS_ORIGINS`: orígenes exactos de la web separados por comas, por ejemplo `https://kasiri.github.io,https://kasiheim.site`.

Reinicia Uvicorn después de copiar el archivo y configurar las variables. La API crea `kasiheim.sqlite3` junto a `api.py`; ese archivo contiene sesiones y progreso y no debe publicarse ni borrarse al actualizar el código. Los tokens de administrador son temporales, se guardan solo en memoria en el navegador y caducan a las 8 horas en el servidor.

Rutas públicas: `GET /api/status` y `GET /api/progress`. El login es `POST /api/admin/login`; las rutas de escritura requieren `Authorization: Bearer <token>`.

## Validación y publicación

```bash
npm run lint
npm run build
python -m unittest backend.tests.test_api
npm run deploy
```

El despliegue de GitHub Pages publica el frontend; el backend del VPS se actualiza por separado.
