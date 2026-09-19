import { getTarget } from '../lib/permissions.js'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import path from 'path'

const execAsync = promisify(exec)

export default {
  name: 'kiss',
  aliases: ['besar', 'muak'],
  description: 'Manda un beso a alguien',
  groupOnly: true,

  async run({ sock, msg, from, sender }) {
    const target = getTarget(msg) || sender
    const targetNumber = target.split('@')[0]
    const senderNumber = sender.split('@')[0]

    try {
      // 1. Obtener URL del gif
      const apiRes = await fetch('https://api.otakugifs.xyz/gif?reaction=kiss')
      const json = await apiRes.json()

      if (!json.url) throw new Error('La API no devolvió URL')

      // 2. Descargar el gif
      const gifRes = await fetch(json.url)
      const gifBuffer = Buffer.from(await gifRes.arrayBuffer())

      // 3. Convertir gif → mp4 con FFmpeg
      const id = Date.now()
      const gifPath = path.join(os.tmpdir(), `kiss-${id}.gif`)
      const mp4Path = path.join(os.tmpdir(), `kiss-${id}.mp4`)

      fs.writeFileSync(gifPath, gifBuffer)

      await execAsync(
        `ffmpeg -y -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${mp4Path}"`,
        { maxBuffer: 1024 * 1024 * 50 }
      )

      const mp4Buffer = fs.readFileSync(mp4Path)

      // 4. Enviar como video (no como sticker, no como gif)
      const caption = target === sender
        ? `💋 @${senderNumber} se mandó un beso al aire`
        : `💋 @${senderNumber} le dio un beso a @${targetNumber}`

      await sock.sendMessage(from, {
        video: mp4Buffer,
        gifPlayback: true,
        caption,
        mentions: [target, sender]
      }, { quoted: msg })

      // 5. Limpiar
      try { fs.unlinkSync(gifPath) } catch {}
      try { fs.unlinkSync(mp4Path) } catch {}

    } catch (e) {
      console.error('❌ [KISS] ERROR:', e.message)
      await sock.sendMessage(from, {
        text: `❌ Error: ${e.message}`
      }, { quoted: msg })
    }
  }
}
