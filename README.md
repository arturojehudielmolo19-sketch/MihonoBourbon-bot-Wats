# MihonoBourbon Bot v1.2

UMA MUSUME EN TODOS LADOS INCLUSO ECATEPEC XD (echo 45% con ayuda de la buena IA de DeepSeek, una IA, echa por una IA, algo bastante ironico)

## 📁 Estructura
- `index.js` → punto de entrada
- `commands/` → comandos
- `lib/db.js` → base de datos JSON
- `lib/permissions.js` → helpers de permisos
- `data/` → datos (warns, rangos, economía)
- `auth_info/` → sesión de WhatsApp (no tocar)
- `cookies.txt` → cookies de YouTube (para .play)

## 🚀 Arrancar
npm start

## 🔧 Mantenimiento
- Si las cookies de YouTube expiran (cada 2-3 meses):
  1. Exportar de nuevo con "Get cookies.txt LOCALLY"
  2. Reemplazar `cookies.txt`
  3. Reiniciar el bot

- Si la sesión de WhatsApp se cae:
  1. Borrar carpeta `auth_info/`
  2. Reiniciar
  3. Escanear QR

## 👤 Owner
"WaosXD"
Asistido por la buena IA DeepSeek

## 📅 v1.2
- Comandos básicos, stickers, descargas YouTube
- Diversión (kiss, hug, slap)
- Economía (work, pescar, ruleta, banco, robar)
- Administración (warn, ban, promote)
- Sistema de rangos
- comando para saber cambios con cada actualizacion
## cosas adicionales
- el top puede hacer top con todos los que hayan interactuado con el, cuidao con eso


Cualquier error, solucionalo vos XD, na mentira, contacta a arturojehudielmolo19@gmail.com y espera entre 1 y 30 dias habiles 

## 🚀 Instalación paso a paso

### 1. Instalar Node.js

1. Ve a [nodejs.org](https://nodejs.org)
2. Descarga la versión **LTS**
3. Ejecuta el instalador y deja todo por defecto (asegúrate de marcar **"Add to PATH"**)
4. **Cierra y reabre** cualquier terminal

**Verificar:**
``bash
node -v
npm -v

2. Instalar Git Bash
Ve a git-scm.com/download/win

Descarga e instala con las opciones por defecto

Verificar:

bash
git --version
3. Instalar FFmpeg
Abre PowerShell (no Git Bash) y corre:

powershell
winget install ffmpeg
Verificar (en Git Bash):

bash
ffmpeg -version
4. Instalar yt-dlp
Descarga el ejecutable: yt-dlp.exe

Mueve el archivo a C:\ffmpeg\bin\

Cierra y reabre Git Bash

Verificar:

bash
yt-dlp --version
5. (Opcional) Instalar aria2
powershell
winget install aria2.aria2
Verificar:

bash
aria2c --version
## 📦 Clonar e instalar el bot
1. Clonar el repositorio
bash
cd ~
git clone https://github.com/arturojehudielmolo19-sketch/MihonoBourbon-bot-Wats.git
cd MihonoBourbon-bot-Wats
2. Instalar dependencias
bash
npm install
Esto instala todas las librerías necesarias. Puede tardar 1-2 minutos.

## 🍪 Configurar cookies de YouTube
Este paso es obligatorio para que funcione .play.

1. Instalar extensión en Chrome
👉 Get cookies.txt LOCALLY

2. Exportar cookies
Abre Chrome y ve a youtube.com

Haz clic en el ícono de la extensión

Clic en "Export"

Guarda el archivo exactamente como:

text
C:\Users\TU_USUARIO\MihonoBourbon-bot-Wats\cookies.txt
Reemplaza TU_USUARIO con tu nombre de usuario de Windows.

Verificar (en Git Bash):

bash
ls -la ~/MihonoBourbon-bot-Wats/cookies.txt
Debe pesar más de 0 bytes.

## 🎬 Primera ejecución
1. Arrancar el bot
bash
npm start
Debe salir:

text
✅ Comando cargado: menu
✅ Comando cargado: ping
...
📦 Total de comandos: XX

🚀 Iniciando bot con Baileys v...
📱 Escanea este QR con WhatsApp:
[QR ASCII]
2. Escanear el QR
Abre WhatsApp en tu celular

Ajustes → Dispositivos vinculados → Vincular un dispositivo

Escanea el QR de la terminal

Cuando conecte:

text
✅ Bot conectado a WhatsApp
3. Registrarte como owner
Paso A: Manda un mensaje desde tu cuenta al bot:

text
.ping
Paso B: Mira la consola. Verás algo como:

text
⚡ Ejecutando: ping | de: 270419831566512@lid | rango: user
Copia ese JID (ej: 270419831566512@lid).

Paso C: Detén el bot con Ctrl + C.

Paso D: Edita el archivo de rangos:

bash
nano ~/MihonoBourbon-bot-Wats/data/ranks.json
Pega:

json
{
  "TU_JID_AQUI": "owner"
}
Paso E: Arranca de nuevo:

bash
npm start
Ahora tus comandos aparecerán con rango: owner. 🎉

## 🎮 Cómo usar el bot
Prefijos disponibles
Puedes usar cualquiera de estos:

.menu

/menu

#menu

!menu


**Comandos básicos**

Comando	Descripción

.menu	Ver todos los comandos

.ping	Prueba de vida + latencia

.changelog	Ver historial de versiones

.version	Ver versión actual

**Stickers**

Comando	Descripción

.sticker / .s	Imagen o video → sticker


.s <texto>	Sticker con nombre personalizado

Uso: Responde a una imagen o video con .s

**Descargas**

'Comando	Descripción'

.play <canción>	Descargar audio de YouTube

.play <URL>	Descargar desde URL de YouTube

**Ejemplos:**

.play never gonna give you up

.play https://www.youtube.com/watch?v=dQw4w9WgXcQ

**Diversión**

.kiss @user	Mandar un beso

.hug @user	Dar un abrazo

.slap @user	Cachetear

**Economía**
Comando	Descripción	Cooldown

.work	Trabajar	5 min

.pescar	Pescar	3 min

.ruleta <cantidad>	Apostar	-

.balance	Ver saldo	-

.depositar <cant>	Al banco	-

.retirar <cant>	Del banco	-

.robar @user	Robar efectivo	5 min

.top	Ranking del grupo	-

'Ejemplos:'

.work

.pescar

.ruleta 100

.ruleta 500 negro

.depositar all

.retirar 200

.robar @amigo

'Rangos del bot'

Comando	Descripción	Requiere

.ranks	Ver lista de rangos	-

.setrank <rango> @user	Dar rango	superadmin

Rangos disponibles: user, admin, superadmin, owner

**Administración de grupos**

Comando	Descripción	Requiere

.warn @user <razón>	Advertir (3 = expulsión)	admin

.unwarn @user	Quitar última advertencia	admin

.warns @user	Ver advertencias	-

.resetwarn @user	Limpiar advertencias	admin

.ban @user <razón>	Expulsar	admin

.promote @user	Hacer admin de WhatsApp	admin

.demote @user	Quitar admin de WhatsApp	admin

**Configuración de grupos**

Comando	Descripción

.antilink on/off	Activar/desactivar borrado de links

.welcome on/off	Activar/desactivar bienvenida

.welcome bye on/off	Activar/desactivar despedida

.welcome set <texto>	Personalizar bienvenida

.welcome setbye <texto>	Personalizar despedida

Variables en textos personalizados:

@user → mención del usuario

@group → nombre del grupo

**Ejemplo:**

.welcome set ¡Bienvenido @user a @group! 🎉

## 🔧 Solución de problemas
node: command not found
No instalaste Node.js bien. Reinstálalo y reinicia la terminal.

ffmpeg: command not found
FFmpeg no está en el PATH. Agrega C:\ffmpeg\bin a las variables de entorno.

yt-dlp: command not found
Mueve yt-dlp.exe a C:\ffmpeg\bin\ y reinicia Git Bash.

**El bot no arranca por dependencias**
bash
cd ~/MihonoBourbon-bot-Wats
rm -rf node_modules
npm install
.play falla con "Sign in to confirm you're not a bot"
Las cookies expiraron (pasa cada 2-3 meses). Vuelve a exportar cookies de YouTube y reemplaza cookies.txt.

**El bot se desconecta solo**
Borra la carpeta auth_info/ y reinicia para escanear QR otra vez:
bash
rm -rf auth_info
npm start
'El bot no responde a nada'
Verifica que la terminal esté abierta

Verifica que el bot diga "✅ Bot conectado a WhatsApp"

Verifica que estés usando uno de los prefijos . / # !

## 📱 Instalación en Termux (Android)
El bot también funciona en Termux (Android) con los mismos comandos, gracias a que usa rutas relativas.

1. Instalar Termux
Descarga Termux desde F-Droid (la versión de Play Store está desactualizada):
👉 Termux en F-Droid

2. Actualizar paquetes
bash
pkg update && pkg upgrade -y

3. Instalar herramientas
bash
pkg install nodejs-lts git ffmpeg python aria2 -y
pip install yt-dlp
Verificar:

bash
node -v
npm -v
ffmpeg -version
yt-dlp --version
aria2c --version

4. Clonar el bot
bash
cd ~
git clone https://github.com/arturojehudielmolo19-sketch/MihonoBourbon-bot-Wats.git
cd MihonoBourbon-bot-Wats

5. Instalar dependencias
bash
npm install
Si alguna dependencia falla:
bash
npm install --no-optional

6. Configurar cookies de YouTube
En Termux no hay Chrome, así que exporta las cookies en tu PC y pásalas al celular.
En tu PC, exporta cookies.txt con la extensión de Chrome
Envía el archivo a tu celular (WhatsApp, Telegram, Drive, etc.)
En Termux, da permisos de almacenamiento:
bash
termux-setup-storage
Mueve el archivo a la carpeta del bot:
bash
mv /sdcard/Download/cookies.txt ~/MihonoBourbon-bot-Wats/cookies.txt
Verificar:
bash
ls -la ~/MihonoBourbon-bot-Wats/cookies.txt

7. Arrancar el bot
bash
npm start
Escanea el QR con WhatsApp y el bot funcionará igual que en Windows.

## ⚠️ Consideraciones para Termux
El bot solo corre mientras la app de Termux esté abierta. Para que siga con la pantalla apagada:

bash

termux-wake-lock

Ejecútalo antes de npm start.

Batería: Termux puede consumir bastante batería si el bot está activo 24/7

Rendimiento: yt-dlp puede ir más lento en celulares de gama baja

Cookies: hay que renovarlas cada 2-3 meses igual que en Windows

## 📁 Estructura del proyecto

MihonoBourbon-bot-Wats/

├── index.js              # Punto de entrada del bot

├── package.json          # Dependencias y scripts

├── cookies.txt           # (no se sube) Cookies de YouTube

├── .gitignore            # Archivos ignorados por git

├── commands/             # Comandos del bot

│   ├── menu.js

│   ├── ping.js

│   ├── sticker.js

│   ├── play.js

│   ├── kiss.js

│   ├── hug.js

│   ├── slap.js

│   ├── work.js

│   ├── pescar.js

│   ├── ruleta.js

│   ├── balance.js

│   ├── depositar.js

│   ├── retirar.js

│   ├── robar.js

│   ├── top.js

│   ├── warn.js

│   ├── ban.js

│   ├── promote.js

│   ├── demote.js

│   ├── antilink.js

│   ├── welcome.js

│   ├── changelog.js

│   └── ...

├── lib/

│   ├── db.js             # Base de datos JSON

│   └── permissions.js    # Helpers de permisos

├── data/                 # Datos persistentes (no se sube)

│   ├── ranks.json

│   ├── economy.json

│   ├── warns.json

│   ├── groups.json

│   └── changelog.json    # (este SÍ se sube)

└── auth_info/            # (no se sube) Sesión de WhatsApp

## 📜 Changelog
Ver el comando .changelog en el bot, o el archivo data/changelog.json.

**v1.2**
✨ Nuevo comando .changelog

**v1.1**
🔧 Arreglado: .top mostraba usuarios de todos los grupos

✨ Nuevo: .top filtra solo usuarios del grupo actual

✨ Nuevo: soporte para múltiples prefijos (. / # !)

*+v1.0**
🤖 Bot base con Baileys

📋 Comandos básicos

🎭 Diversión y stickers

💰 Economía con banco

🚨 Administración de grupos

## 👨‍💻 Créditos
Desarrollador: WaosXD

Asistencia: DeepSeek-IA

Librería principal: Baileys

Herramientas: FFmpeg, yt-dlp, Node.js

## 📄 Licencia
Este proyecto está bajo la licencia MIT. Puedes usarlo, modificarlo y distribuirlo libremente.

¿Dudas o sugerencias? Abre un issue.

Guarda con `Ctrl + O` → `Enter` → `Ctrl + X`.

## Verifica que no se corrompió

``bash
grep -n "Termux\|MihonoBourbon Bot\|WaosXD" ~/MihonoBourbon/README.md
Debe devolver varias líneas:

Me diran que uso mucho la IA, y pues... es verdad XD
