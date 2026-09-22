import { downloadGeneric } from '../lib/downloader.js'

export default {
  name: 'twitter',
  aliases: ['x', 'tw'],
  description: 'Descarga videos de Twitter/X',
  usage: '.twitter <URL>',

  async run({ sock, msg, from, args }) {
    const url = args[0]

    if (!url) {
      return await sock.sendMessage(from, {
        text: '❌ Uso: *.twitter <URL>*\n\n_Ejemplo:_ *.twitter https://x.com/user/status/xxxxx*'
      }, { quoted: msg })
    }

    if (!url.includes('twitter.com') && !url.includes('x.com')) {
      return await sock.sendMessage(from, {
        text: '❌ Ese link no parece ser de Twitter/X.'
      }, { quoted: msg })
    }

    try {
      const processing = await sock.sendMessage(from, {
        text: '⏳ *Descargando de Twitter/X...*\n\n_Esto puede tardar 30-60 segundos._'
      }, { quoted: msg })

      const { buffer, type } = await downloadGeneric(url, {
        timeout: 180000
      })

      try { await sock.sendMessage(from, { delete: msg.key }) } catch {}

      if (type === 'video') {
        await sock.sendMessage(from, {
          video: buffer,
          mimetype: 'video/mp4',
          caption: '📥 *Twitter/X descargado*'
        }, { quoted: msg })
      } else if (type === 'image') {
        await sock.sendMessage(from, {
          image: buffer,
          caption: '📥 *Twitter/X descargado*'
        }, { quoted: msg })
      } else {
        await sock.sendMessage(from, {
          document: buffer,
          fileName: 'twitter.mp4'
        }, { quoted: msg })
      }

      try { await sock.sendMessage(from, { delete: processing.key }) } catch {}

    } catch (e) {
      console.error('❌ Error twitter:', e.message)
      await sock.sendMessage(from, {
        text: `❌ Error: ${e.message}`
      }, { quoted: msg })
    }
  }
}
