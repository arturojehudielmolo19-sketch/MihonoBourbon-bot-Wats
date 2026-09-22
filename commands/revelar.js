import { downloadMediaMessage } from '@whiskeysockets/baileys'

export default {
  name: 'revelar',
  aliases: ['ver', 'rv', 'veronce', 'viewonce'],
  description: 'Revela imágenes/videos de "ver una vez"',

  async run({ sock, msg, from, sender }) {
    try {
      // El mensaje citado (el que el usuario respondió)
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage

      if (!quoted) {
        return await sock.sendMessage(from, {
          text: '❌ Responde a una imagen o video de *"ver una vez"* con este comando.'
        }, { quoted: msg })
      }

      // Detectar viewOnce (viene envuelto en viewOnceMessage o viewOnceMessageV2)
      let mediaMessage = null
      let mediaType = null

      // Caso 1: viewOnceMessage (formato viejo)
      if (quoted.viewOnceMessage?.message) {
        const inner = quoted.viewOnceMessage.message
        if (inner.imageMessage) {
          mediaMessage = inner.imageMessage
          mediaType = 'image'
        } else if (inner.videoMessage) {
          mediaMessage = inner.videoMessage
          mediaType = 'video'
        }
      }

      // Caso 2: viewOnceMessageV2 (formato nuevo)
      if (!mediaMessage && quoted.viewOnceMessageV2?.message) {
        const inner = quoted.viewOnceMessageV2.message
        if (inner.imageMessage) {
          mediaMessage = inner.imageMessage
          mediaType = 'image'
        } else if (inner.videoMessage) {
          mediaMessage = inner.videoMessage
          mediaType = 'video'
        }
      }

      // Caso 3: viewOnceMessageV2Extension (otro formato)
      if (!mediaMessage && quoted.viewOnceMessageV2Extension?.message) {
        const inner = quoted.viewOnceMessageV2Extension.message
        if (inner.imageMessage) {
          mediaMessage = inner.imageMessage
          mediaType = 'image'
        } else if (inner.videoMessage) {
          mediaMessage = inner.videoMessage
          mediaType = 'video'
        }
      }

      // Caso 4: directo (a veces viene sin envolver)
      if (!mediaMessage && quoted.imageMessage?.viewOnce) {
        mediaMessage = quoted.imageMessage
        mediaType = 'image'
      }
      if (!mediaMessage && quoted.videoMessage?.viewOnce) {
        mediaMessage = quoted.videoMessage
        mediaType = 'video'
      }

      if (!mediaMessage) {
        return await sock.sendMessage(from, {
          text: '❌ Ese mensaje no es de *"ver una vez"* o no tiene media.'
        }, { quoted: msg })
      }

      // Descargar la media
      const buffer = await downloadMediaMessage(
        {
          key: msg.message.extendedTextMessage.contextInfo.stanzaId
            ? {
                remoteJid: from,
                fromMe: false,
                id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                participant: msg.message.extendedTextMessage.contextInfo.participant
              }
            : msg.key,
          message: { [mediaType + 'Message']: mediaMessage }
        },
        'buffer',
        {},
        { logger: console, reuploadRequest: sock.updateMediaMessage }
      )

      // Enviar según el tipo
      if (mediaType === 'image') {
        await sock.sendMessage(from, {
          image: buffer,
          caption: '📸 *Imagen revelada*'
        }, { quoted: msg })
      } else if (mediaType === 'video') {
        await sock.sendMessage(from, {
          video: buffer,
          caption: '🎥 *Video revelado*'
        }, { quoted: msg })
      }

    } catch (e) {
      console.error('❌ Error revelar:', e.message)
      await sock.sendMessage(from, {
        text: `❌ Error: ${e.message}`
      }, { quoted: msg })
    }
  }
}
