import { downloadAudio, searchYouTube } from '../lib/downloader.js'

export default {
  name: 'play',
  aliases: ['mp3', 'ytaudio', 'musica'],
  description: 'Descarga audio de YouTube',

  async run({ sock, msg, from, args, sender }) {
    if (!args.length) {
      return await sock.sendMessage(from, {
        text: '❌ Uso: *.play <nombre o URL de YouTube>*'
      }, { quoted: msg })
    }

    const query = args.join(' ')

    try {
      // Buscar video
      const video = await searchYouTube(query)

      if (!video) {
        return await sock.sendMessage(from, {
          text: '❌ No encontré resultados para esa búsqueda.'
        }, { quoted: msg })
      }

      // Mensaje de procesando
      const processing = await sock.sendMessage(from, {
        text: `⏳ *Descargando audio...*\n\n📌 ${video.title}\n⏱️ ${video.duration}\n\n_Esto puede tardar 1-2 minutos._ 🕐`
      }, { quoted: msg })

      // Descargar usando el módulo
      const { buffer } = await downloadAudio(video.url)

      // Enviar
      await sock.sendMessage(from, {
        audio: buffer,
        mimetype: 'audio/mpeg',
        fileName: `${video.title}.mp3`,
        ptt: false
      }, { quoted: msg })

      // Borrar mensaje de procesando
      try {
        await sock.sendMessage(from, { delete: processing.key })
      } catch {}

    } catch (e) {
      console.error('❌ Error play:', e.message)
      await sock.sendMessage(from, {
        text: `❌ Error: ${e.message}`
      }, { quoted: msg })
    }
  }
}
