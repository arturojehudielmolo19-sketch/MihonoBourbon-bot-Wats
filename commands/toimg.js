import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { downloadMediaMessage } from '@whiskeysockets/baileys'

const execAsync = promisify(exec)

export default {
  name: 'toimg',
  aliases: ['toimage', 'img', 'aimg'],
  description: 'Convierte un sticker a imagen PNG',

  async run({ sock, msg, from }) {
    try {
      // Buscar el sticker citado (o el mensaje si es sticker)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage
      const stickerMsg = quoted?.stickerMessage || msg.message?.stickerMessage

      if (!stickerMsg) {
        return await sock.sendMessage(from, {
          text: '❌ Responde a un *sticker* con este comando para convertirlo a imagen.'
        }, { quoted: msg })
      }

      await sock.sendMessage(from, {
        text: '⏳ Convirtiendo sticker a imagen...'
      }, { quoted: msg })

      // Descargar el sticker
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

      // Guardar temporal
      const id = Date.now()
      const inputPath = path.join(os.tmpdir(), `toimg-${id}.webp`)
      const outputPath = path.join(os.tmpdir(), `toimg-${id}.png`)

      fs.writeFileSync(inputPath, buffer)

      // Detectar si es sticker animado
      const isAnimated = stickerMsg.isAnimated === true

      if (isAnimated) {
        // Para stickers animados, mandar como video
        const videoPath = path.join(os.tmpdir(), `toimg-${id}.mp4`)
        await execAsync(
          `ffmpeg -y -i "${inputPath}" -movflags faststart -pix_fmt yuv420p -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" "${videoPath}"`,
          { maxBuffer: 1024 * 1024 * 50 }
        )
        const videoBuffer = fs.readFileSync(videoPath)

        await sock.sendMessage(from, {
          video: videoBuffer,
          mimetype: 'video/mp4',
          caption: '🎥 *Sticker animado convertido*'
        }, { quoted: msg })

        try { fs.unlinkSync(videoPath) } catch {}
      } else {
        // Para stickers estáticos, PNG
        await execAsync(
          `ffmpeg -y -i "${inputPath}" "${outputPath}"`,
          { maxBuffer: 1024 * 1024 * 50 }
        )
        const pngBuffer = fs.readFileSync(outputPath)

        await sock.sendMessage(from, {
          image: pngBuffer,
          caption: '🖼️ *Sticker convertido a imagen*'
        }, { quoted: msg })

        try { fs.unlinkSync(outputPath) } catch {}
      }

      try { fs.unlinkSync(inputPath) } catch {}

    } catch (e) {
      console.error('❌ Error toimg:', e.message)
      await sock.sendMessage(from, {
        text: `❌ Error: ${e.message}`
      }, { quoted: msg })
    }
  }
}
