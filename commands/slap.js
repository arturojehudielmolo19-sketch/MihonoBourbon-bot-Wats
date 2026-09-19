import { getTarget } from '../lib/permissions.js'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import path from 'path'

const execAsync = promisify(exec)

export default {
  name: 'slap',
  aliases: ['cachetada', 'bofetada'],
  description: 'Cachetea a alguien',
  groupOnly: true,

  async run({ sock, msg, from, sender }) {
    const target = getTarget(msg) || sender
    const targetNumber = target.split('@')[0]
    const senderNumber = sender.split('@')[0]

    try {
      const apiRes = await fetch('https://api.otakugifs.xyz/gif?reaction=slap')
      const json = await apiRes.json()
      if (!json.url) throw new Error('La API no devolvió URL')

      const gifRes = await fetch(json.url)
      const gifBuffer = Buffer.from(await gifRes.arrayBuffer())

      const id = Date.now()
      const gifPath = path.join(os.tmpdir(), `slap-${id}.gif`)
      const mp4Path = path.join(os.tmpdir(), `slap-${id}.mp4`)

      fs.writeFileSync(gifPath, gifBuffer)

      await execAsync(
        `ffmpeg -y -i "${gifPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${mp4Path}"`,
        { maxBuffer: 1024 * 1024 * 50 }
      )

      const mp4Buffer = fs.readFileSync(mp4Path)

      const caption = target === sender
        ? `👋 @${senderNumber} se dio una cachetada a sí mismo`
        : `👋 @${senderNumber} le dio una cachetada a @${targetNumber}`

      await sock.sendMessage(from, {
        video: mp4Buffer,
        gifPlayback: true,
        caption,
        mentions: [target, sender]
      }, { quoted: msg })

      try { fs.unlinkSync(gifPath) } catch {}
      try { fs.unlinkSync(mp4Path) } catch {}

    } catch (e) {
      console.error('❌ [SLAP] ERROR:', e.message)
      await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg })
    }
  }
}
