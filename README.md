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

La API comprueba el proceso Valheim que utiliza `VALHEIM_PORT` y consulta el protocolo de servidor A2S por UDP. El ping mostrado es el RTT de la consulta desde el VPS al servidor; no es la latencia individual de cada jugador. La lista de nombres depende de que el servidor responda a `A2S_PLAYER`; si no lo hace, la interfaz informa que no están disponibles en lugar de inventarlos.

La configuración por defecto consulta el proceso del puerto `2458` y hace A2S en `127.0.0.1:2459`. Si AMP usa otro puerto de consulta, configura `VALHEIM_QUERY_PORT`. El estado se actualiza cada 10 segundos.

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
