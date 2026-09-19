import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 🔧 CONFIGURA AQUÍ
const MENU_IMAGE_URL = 'URL_DE_TU_IMAGEN' // ej: 'https://i.imgur.com/xxxxx.jpg'
// O si prefieres imagen local, pon el nombre del archivo y déjalo así:
const MENU_IMAGE_LOCAL = path.join(__dirname, '..', 'menu-image.jpg')

export default {
  name: 'menu',
  aliases: ['help', 'comandos', 'ayuda'],
  description: 'Muestra la lista de comandos',

  async run({ sock, msg, from }) {
    const menuText = `╭━━━〔 * Mihono Bourbon * 〕━━━╮
┃
┃ 📋 *MENÚ DE COMANDOS*
┃
┣━━ 🔹 *BÁSICOS*
┃ • .menu ── Este menú
┃ • .ping ── Prueba de vida
┃ • .info ── Info del bot
┃
┣━━ 🎨 *STICKERS*
┃ • .sticker / .s ── Imagen/video a sticker
┃ • .toimg ── Sticker a imagen
┃
┣━━ 📥 *DESCARGAS*
┃ • .play ── Audio de YouTube
┃
┣━━ 🎭 *DIVERSIÓN*
┃ • .kiss @user ── Beso
┃ • .hug @user ── Abrazo
┃ • .slap @user ── Cachetada
┃
┣━━ 💰 *ECONOMÍA*
┃ • .work ── Trabajar
┃ • .pescar ── Pescar
┃ • .ruleta ── Apostar
┃ • .balance ── Ver saldo
┃ • .depositar ── Al banco
┃ • .retirar ── Del banco
┃ • .robar @user ── Robar
┃ • .top ── Ranking
┃
┣━━ 👑 *RANGOS*
┃ • .ranks ── Ver rangos
┃ • .setrank ── Dar rango
┃
┣━━ 🚨 *ADMINISTRACIÓN*
┃ • .warn @user ── Advertir
┃ • .unwarn @user ── Quitar warn
┃ • .warns @user ── Ver warns
┃ • .resetwarn @user ── Limpiar
┃ • .ban @user ── Expulsar
┃ • .promote @user ── Dar admin
┃ • .demote @user ── Quitar admin
┃ • .antilink ── Links
┃ • .welcome ── Bienvenida
┃
╰━━━━━━━━━━━━━━━━━━━━━━╯

> _Escribe un comando para usarlo_ 🚀`

    // Intentar enviar con imagen
    try {
      // 1. Probar URL primero
      if (MENU_IMAGE_URL && MENU_IMAGE_URL !== 'URL_DE_TU_IMAGEN') {
        await sock.sendMessage(from, {
          image: { url: MENU_IMAGE_URL },
          caption: menuText
        }, { quoted: msg })
        return
      }

      // 2. Probar imagen local
      if (fs.existsSync(MENU_IMAGE_LOCAL)) {
        const imageBuffer = fs.readFileSync(MENU_IMAGE_LOCAL)
        await sock.sendMessage(from, {
          image: imageBuffer,
          caption: menuText
        }, { quoted: msg })
        return
      }

      // 3. Si no hay imagen, solo texto
      await sock.sendMessage(from, { text: menuText }, { quoted: msg })

    } catch (e) {
      console.error('Error menú:', e.message)
      // Fallback a solo texto
      await sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }
  }
}
