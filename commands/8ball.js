const RESPUESTAS = [
  '🎱 Sí, definitivamente.',
  '🎱 Sin duda alguna.',
  '🎱 Confía en ello.',
  '🎱 Definitivamente sí.',
  '🎱 Puedes contar con ello.',
  '🎱 Como yo lo veo, sí.',
  '🎱 Muy probablemente.',
  '🎱 Las perspectivas son buenas.',
  '🎱 Sí.',
  '🎱 Las señales apuntan a que sí.',
  '🎱 Respuesta confusa, intenta de nuevo.',
  '🎱 Pregunta de nuevo más tarde.',
  '🎱 Mejor no decirte ahora.',
  '🎱 No puedo predecirlo ahora.',
  '🎱 Concéntrate y pregunta de nuevo.',
  '🎱 No cuentes con ello.',
  '🎱 Mi respuesta es no.',
  '🎱 Mis fuentes dicen que no.',
  '🎱 Las perspectivas no son buenas.',
  '🎱 Muy dudoso.',
  '🎱 No.',
  '🎱 Absolutamente no.'
]

export default {
  name: '8ball',
  aliases: ['bola8', 'oraculo', 'pregunta'],
  description: 'Pregúntale a la bola mágica',
  usage: '.8ball <pregunta>',

  async run({ sock, msg, from, args, sender, usedPrefix = '.' }) {
    const pregunta = args.join(' ').trim()

    if (!pregunta) {
      return await sock.sendMessage(from, {
        text: `❌ Hazme una pregunta.\n\n_Ejemplo:_ *${usedPrefix}8ball ¿voy a ganar la lotería?*`
      }, { quoted: msg })
    }

    const respuesta = RESPUESTAS[Math.floor(Math.random() * RESPUESTAS.length)]
    const senderNumber = sender.split('@')[0]

    await sock.sendMessage(from, {
      text: `❓ *Pregunta:* ${pregunta}\n\n${respuesta}`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
