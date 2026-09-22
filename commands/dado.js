export default {
  name: 'dado',
  aliases: ['dice', 'd6'],
  description: 'Tira un dado de 6 caras',

  async run({ sock, msg, from, args, sender }) {
    const caras = parseInt(args[0]) || 6

    if (caras < 2 || caras > 100) {
      return await sock.sendMessage(from, {
        text: '❌ El dado debe tener entre 2 y 100 caras.'
      }, { quoted: msg })
    }

    const resultado = Math.floor(Math.random() * caras) + 1
    const senderNumber = sender.split('@')[0]

    // Emojis para dados de 6 caras
    const emojisDado = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅']
    const emoji = caras === 6 ? emojisDado[resultado] : '🎲'

    await sock.sendMessage(from, {
      text: `${emoji} *@${senderNumber}* tiró un dado de ${caras} caras\n\n🎯 Resultado: *${resultado}*`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
