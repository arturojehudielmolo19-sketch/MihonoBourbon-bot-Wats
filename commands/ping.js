export default {
  name: 'ping',
  aliases: ['p'],
  description: 'Prueba de vida del bot',
  async run({ sock, msg, from }) {
    const start = Date.now()
    await sock.sendMessage(from, { text: '🏓 Pong!' }, { quoted: msg })
    const ms = Date.now() - start
    await sock.sendMessage(from, { text: `⏱️ Latencia: ${ms}ms` }, { quoted: msg })
  }
}
