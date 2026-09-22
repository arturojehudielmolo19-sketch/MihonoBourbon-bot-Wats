import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 🔧 CONFIGURA AQUÍ la imagen del menú
// Opción A: URL de imagen (Imgur, Discord, etc.)
const MENU_IMAGE_URL = ''
// Opción B: Archivo local (menu-image.jpg en la raíz del bot)
const MENU_IMAGE_LOCAL = path.join(__dirname, '..', 'menu-image.jpg')

const CURRENT_VERSION = '1.2'

export default {
  name: 'menu',
  aliases: ['help', 'comandos', 'ayuda'],
  description: 'Muestra la lista de comandos',

  async run({ sock, msg, from, usedPrefix = '.' }) {
    const menuText = `╭━━━〔 *Mihono Bourbon* 〕━━━╮
┃
┃ 📋 *MENÚ DE COMANDOS*
┃
┣━━ 🔹 *BÁSICOS*
┃ • ${usedPrefix}menu ── Este menú
┃ • ${usedPrefix}ping ── Prueba de vida
┃ • ${usedPrefix}changelog ── Historial de cambios
┃ • ${usedPrefix}version ── Versión actual
┃
┣━━ 🎨 *STICKERS*
┃ • ${usedPrefix}sticker / ${usedPrefix}s ── Imagen/video a sticker
┃ • ${usedPrefix}s <texto> ── Sticker con nombre
┃
┣━━ 📥 *DESCARGAS*
┃ • ${usedPrefix}play <canción> ── Audio de YouTube
┃
┣━━ 🎭 *DIVERSIÓN*
┃ • ${usedPrefix}kiss @user ── Beso
┃ • ${usedPrefix}hug @user ── Abrazo
┃ • ${usedPrefix}slap @user ── Cachetada
┃
┣━━ 💰 *ECONOMÍA*
┃ • ${usedPrefix}work ── Trabajar
┃ • ${usedPrefix}pescar ── Pescar
┃ • ${usedPrefix}ruleta <cant> ── Apostar
┃ • ${usedPrefix}balance ── Ver saldo
┃ • ${usedPrefix}depositar <cant> ── Al banco
┃ • ${usedPrefix}retirar <cant> ── Del banco
┃ • ${usedPrefix}robar @user ── Robar
┃ • ${usedPrefix}top ── Ranking del grupo
┃
┣━━ 👑 *RANGOS*
┃ • ${usedPrefix}ranks ── Ver rangos
┃ • ${usedPrefix}setrank ── Dar rango
┃
┣━━ 🚨 *ADMINISTRACIÓN*
┃ • ${usedPrefix}warn @user ── Advertir
┃ • ${usedPrefix}unwarn @user ── Quitar warn
┃ • ${usedPrefix}warns @user ── Ver warns
┃ • ${usedPrefix}resetwarn @user ── Limpiar
┃ • ${usedPrefix}ban @user ── Expulsar
┃ • ${usedPrefix}promote @user ── Dar admin
┃ • ${usedPrefix}demote @user ── Quitar admin
┃ • ${usedPrefix}antilink ── Links
┃ • ${usedPrefix}welcome ── Bienvenida
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _💡 Puedes usar_ \`.\` \`/\` \`#\` \`!\` _como prefijo_
> _Escribe_ *${usedPrefix}changelog* _para ver las novedades_ 🚀`

    // Intentar enviar con imagen
    try {
      // 1. Probar URL primero
      if (MENU_IMAGE_URL && MENU_IMAGE_URL.trim() !== '') {
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
      await sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }
  }
}
