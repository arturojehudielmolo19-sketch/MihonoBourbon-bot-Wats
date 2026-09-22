export default {
  name: 'moneda',
  aliases: ['coin', 'flip', 'caraocruz'],
  description: 'Lanza una moneda al aire',

  async run({ sock, msg, from, sender }) {
    const resultado = Math.random() < 0.5 ? 'CARA 🪙' : 'CRUZ 🪙'
    const senderNumber = sender.split('@')[0]

    await sock.sendMessage(from, {
      text: `🪙 *@${senderNumber}* lanzó una moneda...\n\n✨ Salió: *${resultado}*`,
      mentions: [sender]
    }, { quoted: msg })
  }
}
