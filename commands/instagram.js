import { downloadGeneric } from '../lib/downloader.js'

export default {
  name: 'instagram',
  aliases: ['ig', 'insta'],
  description: 'Descarga posts, reels o videos de Instagram',
  usage: '.instagram <URL>',

  async run({ sock, msg, from, args }) {
    const url = args[0]

    if (!url) {
      return await sock.sendMessage(from, {
        text: '❌ Uso: *.instagram <URL>*\n\n_Ejemplo:_ *.instagram https://www.instagram.com/p/xxxxx*'
      }, { quoted: msg })
    }

    if (!url.includes('instagram.com')) {
      return await sock.sendMessage(from, {
        text: '❌ Ese link no parece ser de Instagram.'
      }, { quoted: msg })
    }

    try {
      const processing = await sock.sendMessage(from, {
        text: '⏳ *Descargando de Instagram...*\n\n_Esto puede tardar 30-60 segundos._'
      }, { quoted: msg })

      const { buffer, type } = await downloadGeneric(url, {
        timeout: 180000
      })

      try { await sock.sendMessage(from, { delete: msg.key }) } catch {}

      if (type === 'video') {
        await sock.sendMessage(from, {
          video: buffer,
          mimetype: 'video/mp4',
          caption: '📥 *Instagram descargado*'
        }, { quoted: msg })
      } else if (type === 'image') {
        await sock.sendMessage(from, {
          image: buffer,
          caption: '📥 *Instagram descargado*'
        }, { quoted: msg })
      } else {
        await sock.sendMessage(from, {
          document: buffer,
          fileName: 'instagram.mp4'
        }, { quoted: msg })
      }

      try { await sock.sendMessage(from, { delete: processing.key }) } catch {}

    } catch (e) {
      console.error('❌ Error instagram:', e.message)
      await sock.sendMessage(from, {
        text: `❌ Error: ${e.message}`
      }, { quoted: msg })
    }
  }
}
