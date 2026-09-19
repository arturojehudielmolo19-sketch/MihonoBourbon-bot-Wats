import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import path from 'path'
import webpmux from 'node-webpmux'

const execAsync = promisify(exec)

// Genera metadata EXIF para el sticker (nombre del pack y autor)
async function addExif(webpBuffer, packname, author) {
  const img = new webpmux.Image()
  await img.load(webpBuffer)

  const json = {
    'sticker-pack-id': 'com.mihonobourbon.sticker',
    'sticker-pack-name': packname,
    'sticker-pack-publisher': author,
    'emojis': ['🤖']
  }

  // Construye el bloque EXIF que WhatsApp espera
  const exifAttr = Buffer.from([
    0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
    0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
    0x00, 0x00, 0x16, 0x00, 0x00, 0x00
  ])
  const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
  const exif = Buffer.concat([exifAttr, jsonBuffer])
  exif.writeUIntLE(jsonBuffer.length, 14, 4)

  img.exif = exif
  return await img.save(null)
}

export default {
  name: 'sticker',
  aliases: ['s', 'stiker'],
  description: 'Convierte imagen o video a sticker',
  async run({ sock, msg, from, args }) {
    try {
      // Detectar el mensaje citado (el que el usuario respondió)
      const quoted = msg.message.extendedTextMessage?.contextInfo?.quotedMessage
      const mediaMessage = quoted || msg.message

      // Detectar tipo de media
      const imageMsg = mediaMessage.imageMessage
      const videoMsg = mediaMessage.videoMessage
      const isImage = !!imageMsg
      const isVideo = !!videoMsg

      if (!isImage && !isVideo) {
        return await sock.sendMessage(from, {
          text: '❌ Responde a una imagen o video con *.sticker* para convertirlo.'
        }, { quoted: msg })
      }

      await sock.sendMessage(from, { text: '⏳ Creando sticker...' }, { quoted: msg })

      // Descargar el archivo
      const { downloadMediaMessage } = await import('@whiskeysockets/baileys')
      const mediaBuffer = await downloadMediaMessage(
        { message: mediaMessage, key: msg.key },
        'buffer',
        {},
        { logger: console, reuploadRequest: sock.updateMediaMessage }
      )

      // Guardar temporal
      const id = Date.now()
      const inputExt = isImage ? 'jpg' : 'mp4'
      const inputPath = path.join(os.tmpdir(), `stick-${id}.${inputExt}`)
      const outputPath = path.join(os.tmpdir(), `stick-${id}.webp`)

      fs.writeFileSync(inputPath, mediaBuffer)

      // Convertir a webp con FFmpeg
      const ffmpegCmd = isImage
        ? `ffmpeg -y -i "${inputPath}" -vf "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0" -vcodec libwebp -lossless 0 -q:v 75 -preset default -an "${outputPath}"`
        : `ffmpeg -y -i "${inputPath}" -vf "scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=white@0.0,fps=15" -vcodec libwebp -lossless 0 -q:v 50 -preset default -an -t 6 "${outputPath}"`

      await execAsync(ffmpegCmd, { maxBuffer: 1024 * 1024 * 50 })

      // Leer el webp y agregar metadata
      let webpBuffer = fs.readFileSync(outputPath)
            webpBuffer = await addExif(webpBuffer, 'Creado con BourbonGPT', 'MihonoBourbon')

      // Enviar como sticker
      await sock.sendMessage(from, { sticker: webpBuffer }, { quoted: msg })

      // Limpiar temporales
      try { fs.unlinkSync(inputPath) } catch {}
      try { fs.unlinkSync(outputPath) } catch {}

    } catch (e) {
      console.error('❌ Error sticker:', e)
      await sock.sendMessage(from, { text: `❌ Error: ${e.message}` }, { quoted: msg })
    }
  }
}
