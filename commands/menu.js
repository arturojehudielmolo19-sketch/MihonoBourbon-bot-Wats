import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// 🔧 CONFIGURA AQUÍ la imagen del menú
const MENU_IMAGE_URL = ''
const MENU_IMAGE_LOCAL = path.join(__dirname, '..', 'menu-image.jpg')

const CURRENT_VERSION = '2.0'

export default {
  name: 'menu',
  aliases: ['help', 'comandos', 'ayuda'],
  description: 'Muestra la lista de comandos',

  async run({ sock, msg, from, usedPrefix = '.' }) {
    const p = usedPrefix

    const menuText = `╭━━━〔 🤖 *MihonoBourbon v${CURRENT_VERSION}* 〕━━━╮
┃
┃ 📋 *MENÚ DE COMANDOS*
┃
┣━━ 🔹 *BÁSICOS*
┃ • ${p}menu ── Este menú
┃ • ${p}ping ── Prueba de vida
┃ • ${p}changelog ── Historial de cambios
┃ • ${p}version ── Versión actual
┃
┣━━ 🎨 *STICKERS Y MEDIA*
┃ • ${p}sticker / ${p}s ── Imagen/video a sticker
┃ • ${p}toimg ── Sticker a imagen
┃ • ${p}tovideo ── Sticker animado a video
┃ • ${p}attp ── Texto a sticker animado
┃ • ${p}revelar ── Revelar imagen de "ver una vez"
┃
┣━━ 📥 *DESCARGAS*
┃ • ${p}play ── Audio de YouTube
┃ • ${p}instagram ── Posts/reels de IG
┃ • ${p}twitter ── Videos de Twitter/X
┃
┣━━ 🎭 *DIVERSIÓN*
┃ • ${p}kiss @user ── Beso
┃ • ${p}hug @user ── Abrazo
┃ • ${p}slap @user ── Cachetada
┃ • ${p}piropo @user ── Piropo
┃ • ${p}8ball ── Bola mágica
┃ • ${p}dado ── Tirar dado
┃ • ${p}moneda ── Cara o cruz
┃ • ${p}frase ── Frase del día
┃
┣━━ 👤 *PERFIL*
┃ • ${p}perfil ── Ver perfil
┃ • ${p}setnombre ── Definir nombre
┃ • ${p}setgenero ── Definir género
┃ • ${p}setbio ── Definir bio
┃ • ${p}setedad ── Definir edad
┃
┣━━ 📊 *NIVELES*
┃ • ${p}nivel ── Ver tu nivel y XP
┃ • ${p}topniveles ── Ranking del grupo
┃
┣━━ 💰 *ECONOMÍA*
┃ • ${p}balance ── Ver saldo
┃ • ${p}work ── Trabajar
┃ • ${p}pescar ── Pescar
┃ • ${p}minar ── Minar
┃ • ${p}cazar ── Cazar
┃ • ${p}crimen ── Alto riesgo
┃ • ${p}daily ── Recompensa diaria
┃ • ${p}ruleta ── Apostar
┃ • ${p}loteria ── Comprar boletos
┃ • ${p}depositar ── Al banco
┃ • ${p}retirar ── Del banco
┃ • ${p}robar @user ── Robar
┃ • ${p}top ── Ranking de ricos
┃
┣━━ 🛒 *TIENDA*
┃ • ${p}tienda ── Ver items
┃ • ${p}comprar <id> ── Comprar item
┃ • ${p}inv ── Ver inventario
┃ • ${p}usar <id> ── Usar item
┃
┣━━ 👑 *RANGOS*
┃ • ${p}ranks ── Ver rangos
┃ • ${p}setrank ── Dar rango
┃
┣━━ 🚨 *ADMINISTRACIÓN*
┃ • ${p}warn @user ── Advertir
┃ • ${p}unwarn @user ── Quitar warn
┃ • ${p}warns @user ── Ver warns
┃ • ${p}resetwarn @user ── Limpiar
┃ • ${p}ban @user ── Expulsar
┃ • ${p}promote @user ── Dar admin
┃ • ${p}demote @user ── Quitar admin
┃ • ${p}antilink ── Links
┃ • ${p}welcome ── Bienvenida
┃
┣━━ ⚙️ *CONFIG*
┃ • ${p}setconfig ── Config de economía (owner)
┃
╰━━━━━━━━━━━━━━━━━━━━━━━╯

> _💡 Puedes usar_ \`.\` \`/\` \`#\` \`!\` _como prefijo_
> _Escribe_ *${p}changelog* _para ver las novedades_ 🚀`

    try {
      if (MENU_IMAGE_URL && MENU_IMAGE_URL.trim() !== '') {
        await sock.sendMessage(from, {
          image: { url: MENU_IMAGE_URL },
          caption: menuText
        }, { quoted: msg })
        return
      }

      if (fs.existsSync(MENU_IMAGE_LOCAL)) {
        const imageBuffer = fs.readFileSync(MENU_IMAGE_LOCAL)
        await sock.sendMessage(from, {
          image: imageBuffer,
          caption: menuText
        }, { quoted: msg })
        return
      }

      await sock.sendMessage(from, { text: menuText }, { quoted: msg })
    } catch (e) {
      console.error('Error menú:', e.message)
      await sock.sendMessage(from, { text: menuText }, { quoted: msg })
    }
  }
}
