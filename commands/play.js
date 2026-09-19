import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import path from 'path'
import yts from 'yt-search'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const execAsync = promisify(exec)

const COOKIES_PATH = path.join(__dirname, '..', 'cookies.txt')

export default {
  name: 'play',
  aliases: ['mp3', 'ytaudio', 'musica'],
  description: 'Descarga audio de YouTube',
  async run({ sock, msg, from, args }) {
    if (!args.length) {
      return await sock.sendMessage(from, {
        text: '❌ Uso: *.play <nombre o URL de YouTube>*'
      }, { quoted: msg })
    }

    const query = args.join(' ')

    try {
      let videoUrl, videoTitle, videoThumbnail, videoDuration

      // Si es URL directa de YouTube
      if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(query)) {
        videoUrl = query
        // Obtener info del video
        const search = await yts({ videoId: extractVideoId(query) })
        if (search) {
          videoTitle = search.title
          videoThumbnail = search.thumbnail
          videoDuration = search.timestamp
        }
      } else {
        // Buscar en YouTube
        const search = await yts(query)
        const video = search.videos?.[0]

        if (!video) {
          return await sock.sendMessage(from, {
            text: '❌ No encontré resultados para esa búsqueda.'
          }, { quoted: msg })
        }

        videoUrl = video.url
        videoTitle = video.title
        videoThumbnail = video.thumbnail
        videoDuration = video.timestamp
      }

      // Mensaje de "procesando"
      const processing = await sock.sendMessage(from, {
        text: `⏳ *Descargando audio...*\n\n📌 ${videoTitle || 'Video'}\n⏱️ Duración: ${videoDuration || '?'}\n\n_Esto puede tardar 1-3 minutos, por favor espera..._`
      }, { quoted: msg })

      // Preparar rutas temporales
      const id = Date.now()
      const tmpBase = path.join(os.tmpdir(), `play-${id}`)
      const mp3Path = `${tmpBase}.mp3`

      // Comando yt-dlp optimizado
      const cmd = `yt-dlp --js-runtimes node --cookies "${COOKIES_PATH}" --downloader aria2c --downloader-args "aria2c:--http-accept-gzip=false --disable-ipv6=true" -x --audio-format mp3 --no-playlist -o "${tmpBase}.%(ext)s" "${videoUrl}"`

      await execAsync(cmd, {
        maxBuffer: 1024 * 1024 * 100,
        timeout: 300000
      })

      // Leer el mp3
      const audioBuffer = fs.readFileSync(mp3Path)

      // Enviar como audio
      await sock.sendMessage(from, {
        audio: audioBuffer,
        mimetype: 'audio/mpeg',
        fileName: `${videoTitle || 'audio'}.mp3`,
        ptt: false
      }, { quoted: msg })

      // Borrar el mensaje de "procesando"
      try {
        await sock.sendMessage(from, {
          delete: processing.key
        })
      } catch {}

      // Limpiar archivo temporal
      try { fs.unlinkSync(mp3Path) } catch {}

    } catch (e) {
      console.error('❌ Error play:', e.message)
      await sock.sendMessage(from, {
        text: `❌ Error al descargar: ${e.message}`
      }, { quoted: msg })
    }
  }
}

function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}
