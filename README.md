# UNAHUR-MCP — El puente entre tu agente y el campus virtual de la UNAHUR.

> [!NOTE]
> **Basado en [utn-mcp](https://github.com/nialvape/utn-mcp)**, de [Joaquín Peñalva](https://github.com/nialvape). Todo el trabajo y el mérito de este proyecto son suyos; este fork es solamente una adaptación al campus de la UNAHUR. Si estudiás en la UTN, usá el original. Si te gustó, dale una estrellita al original ❤️

Este es el Model Context Protocol server NO OFICIAL de la Universidad Nacional de Hurlingham. Con él podés pedirle a tu agente de preferencia (Claude, ChatGPT, etc.) que busque información y lea los apuntes del aula virtual y, con tu confirmación, que publique en los foros o entregue tareas. Corre en tu computadora o como servidor HTTP con OAuth, para usarlo desde cualquier lado.

## Qué podés pedirle
- *"¿Cuándo es el recuperatorio del primer parcial de Álgebra?"*
- *"¿Qué avisó la profesora de Física esta semana?"*
- *"Resumime la guía de la unidad 3 de Sistemas Operativos."*
- *"Pasame el link para bajar el apunte de calorimetría."*
- *"¿Qué nota me pusieron en el TP1 y qué me corrigieron?"*
- *"Preguntá en el foro de consultas si el parcial incluye la unidad 4."*
- *"Anotame en el grupo 6."*
- *"Agendame el recuperatorio del 14 a las 18."*

El agente recorre el aula como lo harías vos: entra al curso, mira los foros y abre los archivos que hagan falta.

## Tools
| Tool | Qué hace |
|---|---|
| `aula_list_courses` | Lista tus cursos. Es el punto de partida. |
| `aula_open` | Entra a un curso, un módulo, un foro o una discusión. Cada respuesta trae las direcciones de lo que hay adentro y de un nivel más arriba, así el agente navega sin perderse. |
| `aula_read_file` | Lee un archivo del aula, por partes cuando es largo. |
| `aula_get_site_info` | Datos de tu usuario y de tu campus en el aula virtual. |
| `aula_forum_post` | Abre un hilo en un foro o responde en una discusión. |
| `aula_forum_edit_post` | Edita una publicación tuya. |
| `aula_forum_delete_post` | Borra una publicación tuya. |
| `aula_assign_submit` | Entrega una tarea: sube archivos de tu compu, escribe el texto en línea y confirma el envío. |
| `aula_assign_upload_link` | Solo en modo HTTP: un link para subir los archivos de una entrega, que usa el agente con `curl` o vos desde el navegador. |
| `aula_choice_answer` | Responde una elección o te anota en un grupo. |
| `aula_send_message` | Manda un mensaje privado a un docente o compañero. |
| `aula_calendar_add_event` | Agrega un recordatorio a tu calendario del aula. |

Al abrir una tarea, `aula_open` muestra si la entregaste, cuándo vence y la devolución con la nota. Las tools que escriben le piden al agente que te muestre lo que va a hacer y espere tu confirmación.

### Archivos que puede leer
- **PDF**: el texto, página por página. Los **escaneados** se mandan como imagen de cada página, y el agente los lee igual.
- **Word (.docx), PowerPoint (.pptx) y Excel (.xlsx)**: el texto, con las tablas fila por fila.
- **Imágenes** (PNG, JPG, GIF) y texto plano.

Los formatos viejos de Office (.doc, .ppt, .pps), los comprimidos (.zip, .rar) y los videos no se leen. En ese caso el agente te pasa el link para que lo bajes.

### Links de descarga
Cada archivo viene con un link del aula virtual que podés abrir en tu navegador. Funciona con tu sesión del aula (si no estás logueado te manda al login) y **nunca incluye tu token**: ese queda siempre en tu computadora.

## Cómo instalar
Necesitás [Node.js](https://nodejs.org) 20 o superior. No hace falta clonar el repo ni instalar nada a mano: `npx` descarga el paquete solo.

### 1. Iniciar sesión
```bash
npx -y unahur-mcp login
```
Te pide tu campus, tu usuario y tu contraseña: los mismos con los que entrás al aula virtual. Se hace una sola vez: después el servidor renueva la sesión solo.

### 2. Agregarlo a tu cliente

**Claude Code**
```bash
claude mcp add unahur -- npx -y unahur-mcp
```

**Claude Desktop**: en *Settings → Developer → Edit Config*, agregá dentro de `mcpServers`:
```json
"unahur": {
  "command": "npx",
  "args": ["-y", "unahur-mcp"]
}
```
En Windows, si no arranca, usá `"command": "cmd"` y `"args": ["/c", "npx", "-y", "unahur-mcp"]`. Después reiniciá Claude Desktop por completo.

**Codex**
```bash
codex mcp add unahur -- npx -y unahur-mcp
```

**Gemini CLI**
```bash
gemini mcp add unahur npx -y unahur-mcp
```

**OpenClaw**
```bash
openclaw mcp add unahur --command npx --arg -y --arg unahur-mcp
```

**Hermes**: en `~/.hermes/config.yaml`:
```yaml
mcp_servers:
  unahur:
    command: "npx"
    args: ["-y", "unahur-mcp"]
```

**Cursor**: en `~/.cursor/mcp.json`:
```json
{
  "mcpServers": {
    "unahur": { "command": "npx", "args": ["-y", "unahur-mcp"] }
  }
}
```

**VS Code**: en `.vscode/mcp.json` (o con *MCP: Add Server* desde la paleta de comandos):
```json
{
  "servers": {
    "unahur": { "type": "stdio", "command": "npx", "args": ["-y", "unahur-mcp"] }
  }
}
```

**ChatGPT**: solo se conecta a servidores MCP remotos por HTTPS, así que necesita un servidor en modo HTTP publicado en internet (ver [Hostearlo para otros](#hostearlo-para-otros)). Se agrega como conector desde *Configuración → Apps y conectores*, con el modo desarrollador activado. Los conectores propios están desde el plan Pro, y ahí solo con las herramientas de lectura; para usar también las de escritura (foros, mensajes, entregas) hace falta Business o superior.

**Otros clientes (Windsurf, opencode, etc.)**: cualquier cliente MCP que lance servidores por STDIO sirve con el comando `npx -y unahur-mcp`.

### Instalación global (opcional)
Si preferís tener el comando `unahur-mcp` siempre disponible:
```bash
npm i -g unahur-mcp
unahur-mcp login
```
y en la config del cliente usás `"command": "unahur-mcp"` sin argumentos.

### Campus
La UNAHUR tiene un campus virtual (Moodle) por año lectivo, `campusAAAA.unahur.edu.ar`. La lista se arma sola: va del año actual hasta 2023, el primero que existe, así que cada año aparece el campus nuevo sin actualizar nada. El campus se elige al iniciar sesión; viene marcado el del año. Campus 2026 ya está probado; los demás tienen habilitado el servicio que usa UNAHUR-MCP, así que casi seguro andan. Para cambiar de campus, volvé a correr `login`.

Al principio del año el campus nuevo puede no existir todavía: si el login falla con el que viene marcado, elegí el del año anterior.

Si querés usar un aula que no sigue ese formato, definila en un `.env` en la carpeta desde donde corrés `unahur-mcp` (o en el entorno) y aparece como una opción más al iniciar sesión:
```bash
UTN_AULA_BASE_URL=https://otra-aula.unahur.edu.ar
```

`UTN_REGIONAL` (por ejemplo, `UTN_REGIONAL=2025`) elige el que viene marcado por defecto, y es la que se usa si en lugar de `login` definís `UTN_USER` y `UTN_PASS`.

### Modo HTTP (opcional)
Necesita Node 22.13 o más nuevo. Primero, una vez:
```bash
npx -y unahur-mcp login --http
```
Te muestra un token: configurá tu cliente MCP para que mande el header `Authorization: Bearer <token>`. Después:
```bash
npx -y unahur-mcp --http --port 3000
```
Levanta el servidor en `http://127.0.0.1:3000/mcp`, solo accesible desde tu propia máquina. Tenés que dejar la terminal abierta mientras lo uses.

En este modo el servidor no lee archivos de tu disco: para entregar, el agente pide un link con `aula_assign_upload_link` y sube ahí los archivos con `curl` si tiene terminal, o te pasa el link para que los elijas desde el navegador.

### Hostearlo para otros
En modo HTTP el servidor también es servidor de autorización OAuth: un cliente MCP (Claude, ChatGPT) que se conecta a `https://tu-dominio/mcp` recibe un 401, descubre el OAuth y abre una página donde el alumno elige su campus y entra con su usuario de la UNAHUR. Cada alumno usa el campus que elige. Ese login vincula su aula: la contraseña se usa una sola vez para sacar el token de Moodle y **no se guarda**. Cuando la sesión del aula vence, el agente le pasa el link de `/login` para renovarla, sin reconectar el cliente.

Quién puede entrar lo decidís vos: con `UTN_MCP_ALLOWED_EMAILS` (una lista), o con `UTN_MCP_ACCESS_URL`, que apunta a un servicio tuyo. El servidor le hace `POST` con `{ "email", "usuario", "regional" }` y el header `Authorization: Bearer <UTN_MCP_ACCESS_SECRET>`, y espera `{ "permitido": true }` o `{ "permitido": false, "motivo": "...", "url": "..." }`. Se consulta al conectar y en cada renovación del token (cada hora), así que una baja se aplica sola.

La configuración va en variables de entorno o en un `.env` en la carpeta desde donde lo corrés (copiá [`.env.example`](.env.example)):

| Variable | Para qué | Por defecto |
|---|---|---|
| `HOST`, `PORT` | Dónde escucha. | `127.0.0.1`, `3000` |
| `UTN_MCP_PUBLIC_URL` | Dirección pública (`https://mcp.tu-dominio.com`). Es el issuer del OAuth, la base de los links de subida y el único host, además de localhost, que se acepta en `Host` y `Origin`. | `http://127.0.0.1:<PORT>` |
| `UTN_MCP_ACCESS_URL`, `UTN_MCP_ACCESS_SECRET` | Servicio que decide quién puede entrar. | — |
| `UTN_MCP_ALLOWED_EMAILS` | Emails o dominios (`@unahur.edu.ar`) habilitados, separados por coma, si no hay `UTN_MCP_ACCESS_URL`. | Entra cualquiera con usuario de la UNAHUR |
| `UTN_MCP_REDIRECT_ALLOW` | Hosts (`app.ejemplo.com`) o esquemas (`miapp:`) extra, separados por coma, a los que puede volver el login de OAuth. Loopback, Claude, ChatGPT, VS Code y Cursor pasan siempre. Cualquier otro host HTTPS (un agente propio, por ejemplo) se acepta, pero el login avisa a dónde vuelve y el alumno tiene que marcar que lo conecta bajo su responsabilidad: es la defensa contra alguien que use tu página de login para quedarse con su sesión. Los hosts de esta lista pasan sin aviso. | — |
| `UTN_MCP_ADMIN_SECRET` | Habilita la API de `/admin` para un panel de cuentas tuyo: `POST /admin/usuarios` (todos los usuarios con sus apps), `/admin/clientes` y `/admin/clientes/revocar` (las apps de un usuario, por email), `/admin/regionales` (los campus con su soporte) y `/admin/verificar` (entra al aula con usuario y contraseña, como el login de OAuth, y le guarda la sesión). | — |
| `UTN_MCP_LOGIN_URL` | Página donde el usuario renueva su sesión del aula; el agente se la pasa. | `<UTN_MCP_PUBLIC_URL>/login` |
| `UTN_MCP_DB`, `UTN_MCP_KEY` | Base de sesiones y su clave de cifrado (32 bytes en base64). | En la carpeta de config |

Con Docker, detrás de un reverse proxy con HTTPS en la misma máquina (red host, para que el rate limit del login vea la IP real):
```bash
docker build -t unahur-mcp .
docker run -d --name unahur-mcp --network host --restart unless-stopped \
  -e HOST=127.0.0.1 -e PORT=8100 -e UTN_MCP_PUBLIC_URL=https://mcp.tu-dominio.com \
  -e UTN_MCP_KEY=$(openssl rand -base64 32) -v unahur-mcp-data:/data unahur-mcp
```
Guardá esa `UTN_MCP_KEY`: sin ella no se pueden descifrar las sesiones guardadas.

## Dónde se guardan tus datos
Instalado en tu computadora, todo queda ahí:
- **Usuario y contraseña**: en el gestor de credenciales del sistema (Windows Credential Manager, Keychain en macOS, Secret Service en Linux).
- **Token del aula virtual**: en `%APPDATA%\unahur-mcp\session.json` (Windows) o `~/.config/unahur-mcp/session.json` (Linux y macOS).
- **En modo HTTP**: la contraseña no se guarda; la sesión va cifrada en `unahur-mcp.db`, en la misma carpeta, con la clave de `store.key` (o la de `UTN_MCP_KEY`). Del token del cliente solo se guarda el hash.

En Linux sin gestor de credenciales (servidores, Docker, WSL) podés definir las variables de entorno `UTN_USER` y `UTN_PASS` en lugar de usar `login`.

Si usás un servidor hosteado por otra persona, tu sesión del aula la guarda ese servidor (cifrada, y sin tu contraseña): revisá su política de privacidad.

## Desarrollo
```bash
git clone https://github.com/franiiel/unahur-mcp.git
cd unahur-mcp
npm install
npm run login   # una vez
npm run dev     # servidor por STDIO desde src/, con tsx
npm run build   # compila a build/
```

pdf.js no es una dependencia del paquete publicado. Está como `devDependency`, y `npm install` corre el script `prepare`, que copia a `vendor/pdfjs/` solo los archivos que usa el servidor (~4 MB). Así, quien instala `unahur-mcp` no baja pdf.js entero ni su canvas nativo opcional (~37 MB). Si instalaste con `--ignore-scripts`, generalo a mano con `npm run prepare`.

## Aviso
Este proyecto no está afiliado ni avalado por la UNAHUR ni por la UTN. Está basado en [utn-mcp](https://github.com/nialvape/utn-mcp), de Joaquín Peñalva (licencia ISC). Usalo bajo tu responsabilidad.
