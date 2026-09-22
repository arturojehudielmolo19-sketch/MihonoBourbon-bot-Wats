import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

const execAsync = promisify(exec)

export default {
  name: 'tovideo',
  aliases: ['tomp4', 'tov'],
  description: 'Convierte un sticker animado a video MP4',

  async run({ sock, msg, from }) {
    try {
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const stickerMsg = quoted?.stickerMessage || msg.message?.stickerMessage

      if (!stickerMsg) {
        return await sock.sendMessage(from, {
          text: '❌ Responde a un *sticker animado* con este comando.'
        }, { quoted: msg })
      }

      if (!stickerMsg.isAnimated) {
        return await sock.sendMessage(from, {
          text: '❌ Ese sticker no es animado. Usa *.toimg* para stickers estáticos.'
        }, { quoted: msg })
      }

      await sock.sendMessage(from, {
        text: '⏳ Convirtiendo sticker a video...'
      }, { quoted: msg })

      const buffer = await downloadMediaMessage(
        {
          key: msg.message.extendedTextMessage?.contextInfo?.stanzaId
            ? {
                remoteJid: from,
                fromMe: false,
                id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                participant: msg.message.extendedTextMessage.contextInfo.participant
              }
            : msg.key,
          message: { stickerMessage: stickerMsg }
        },
        'buffer',
        {},
        { logger: console, reuploadMessage: sock.updateMediaMessage }
      )

      const id = Date.now()
      const inputPath = path.join(os.tmpdir(), `tov-${id}.webp`)
      const outputPath = path.join(os.tmpdir(), `tov-${id}.mp4`)

      fs.writeFileSync(inputPath, buffer)

      await execAsync(
        `ffmpeg -y -i "${inputPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${outputPath}"`,
        { maxBuffer: 1024 * 1024 * 50 }
      )

      const videoBuffer = fs.readFileSync(outputPath)

      await sock.sendMessage(from, {
        video: videoBuffer,
        mimetype: 'video/mp4',
        caption: '🎥 *Sticker convertido a video*'
      }, { quoted: msg })

      try { fs.unlinkSync(inputPath) } catch {}
      try { fs.unlinkSync(outputPath) } catch {}

    } catch (e) {
      console.error('❌ Error tovideo:', e.message)
      await sock.sendMessage(from, {
        text: `❌ Error: ${e.message}`
      }, { quoted: msg })
    }
  }
}
