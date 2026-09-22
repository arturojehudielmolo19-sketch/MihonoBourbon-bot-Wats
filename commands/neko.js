import db from '../lib/db.js'
import { isGroup } from '../lib/permissions.js'

export default {
  name: 'neko',
  aliases: ['nekos'],
  description: 'Imagen aleatoria de neko',
  nsfw: true,
  groupOnly: true,

  async run({ sock, msg, from, usedPrefix = '.' }) {
    if (!isGroup(from)) {
      return await sock.sendMessage(from, {
        text: '❌ Este comando solo funciona en grupos.'
      }, { quoted: msg })
    }

    if (!db.getGroupSetting(from, 'nsfw', false)) {
      return await sock.sendMessage(from, {
        text: `❌ Los comandos +18 están desactivados en este grupo.\n\nUn admin puede activarlos con *${usedPrefix}nsfw on*.`
      }, { quoted: msg })
    }

    try {
      const res = await fetch('https://api.waifu.pics/sfw/neko')
      const data = await res.json()
      const buffer = await (await fetch(data.url)).arrayBuffer()

      await sock.sendMessage(from, {
        image: Buffer.from(buffer),
        caption: '🐱 *Neko aleatoria*\n\n_Contenido sugerente_'
      }, { quoted: msg })
    } catch (e) {
      console.error('Error neko:', e.message)
      await sock.sendMessage(from, {
        text: '❌ No pude obtener la imagen.'
      }, { quoted: msg })
    }
  }
}
