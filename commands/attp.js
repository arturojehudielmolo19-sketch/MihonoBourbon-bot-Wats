import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import path from 'path'

const execAsync = promisify(exec)

export default {
  name: 'attp',
  aliases: ['textosticker', 'sticktext'],
  description: 'Convierte texto a sticker animado',
  usage: '.attp <texto>',

  async run({ sock, msg, from, args }) {
    const texto = args.join(' ').trim()

    if (!texto) {
      return await sock.sendMessage(from, {
        text: '❌ Uso: *.attp <texto>*\n\n_Ejemplo:_ *.attp Hola mundo*'
      }, { quoted: msg })
    }

    if (texto.length > 30) {
      return await sock.sendMessage(from, {
        text: '❌ El texto es muy largo (máximo 30 caracteres).'
      }, { quoted: msg })
    }

    try {
      await sock.sendMessage(from, {
        text: '⏳ Creando sticker animado...'
      }, { quoted: msg })

      const id = Date.now()
      const outputPath = path.join(os.tmpdir(), `attp-${id}.webp`)

      // Colores aleatorios para el fondo
      const colores = [
        { bg: 'FF1493', text: 'FFFFFF' },  // Rosa
        { bg: '00BFFF', text: 'FFFFFF' },  // Azul
        { bg: '32CD32', text: '000000' },  // Verde
        { bg: 'FFD700', text: '000000' },  // Dorado
        { bg: '8A2BE2', text: 'FFFFFF' },  // Morado
        { bg: 'FF4500', text: 'FFFFFF' },  // Rojo-naranja
        { bg: '000000', text: '00FF00' }   // Negro con verde neón
      ]
      const color = colores[Math.floor(Math.random() * colores.length)]

      // Escapar caracteres especiales para FFmpeg
      const textoEscapado = texto
        .replace(/\\/g, '\\\\')
        .replace(/:/g, '\\:')
        .replace(/'/g, "\\'")
        .replace(/"/g, '\\"')
        .replace(/%/g, '\\%')

      // Crear video de 3 segundos con texto animado (zoom)
      await execAsync(
        `ffmpeg -y -f lavfi -i "color=c=0x${color.bg}:s=512x512:d=3" -vf "drawtext=text='${textoEscapado}':fontcolor=0x${color.text}:fontsize=60:x=(w-text_w)/2:y=(h-text_h)/2:fontfile='C\\:/Windows/Fonts/arial.ttf',scale='min(512,iw)':min'(512,ih)':force_original_aspect_ratio=decrease,pad=512:512:-1:-1:color=0x${color.bg}@0.0,fps=15" -vcodec libwebp -lossless 0 -q:v 50 -preset default -an -t 3 "${outputPath}"`,
        { maxBuffer: 1024 * 1024 * 50, timeout: 60000 }
      )

      const webpBuffer = fs.readFileSync(outputPath)

      await sock.sendMessage(from, {
        sticker: webpBuffer
      }, { quoted: msg })

      try { fs.unlinkSync(outputPath) } catch {}

    } catch (e) {
      console.error('❌ Error attp:', e.message)
      await sock.sendMessage(from, {
        text: `❌ Error al crear sticker: ${e.message}`
      }, { quoted: msg })
    }
  }
}
