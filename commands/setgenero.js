import db from '../lib/db.js'

const GENEROS_VALIDOS = ['Hombre', 'Mujer', 'Otro', 'Oculto']

export default {
  name: 'setgenero',
  aliases: ['genero', 'gender'],
  description: 'Define tu género',
  usage: '.setgenero <Hombre|Mujer|Otro|Oculto>',

  async run({ sock, msg, from, sender, args }) {
    const genero = args[0]

    if (!genero) {
      const perfil = db.getProfile(sender)
      return await sock.sendMessage(from, {
        text: `⚧️ *Tu género actual:* ${perfil.genero || '(no definido)'}\n\n*Opciones válidas:*\n• Hombre\n• Mujer\n• Otro\n• Oculto\n\n_Ejemplo:_ *.setgenero Hombre*`
      }, { quoted: msg })
    }

    // Normalizar
    const generoNormalizado = GENEROS_VALIDOS.find(
      g => g.toLowerCase() === genero.toLowerCase()
    )

    if (!generoNormalizado) {
      return await sock.sendMessage(from, {
        text: `❌ Género inválido.\n\n*Opciones:* ${GENEROS_VALIDOS.join(', ')}`
      }, { quoted: msg })
    }

    db.setProfileField(sender, 'genero', generoNormalizado)

    await sock.sendMessage(from, {
      text: `✅ Género actualizado a: *${generoNormalizado}*`
    }, { quoted: msg })
  }
}
