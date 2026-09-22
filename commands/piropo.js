import { getTarget } from '../lib/permissions.js'

const PIROPOS = [
  '¿Crees en el amor a primera vista o tengo que pasar otra vez? 😏',
  'Si fueras un vegetal, serías una zanahoria, porque te ves muy bien. 🥕',
  '¿Tienes un mapa? Porque me perdí en tus ojos. 🗺️',
  'Si belleza fuera un crimen, te darían cadena perpetua. 👮',
  '¿De qué signo eres? Porque te ves como mi media naranja. 🍊',
  'No soy fotógrafo, pero puedo imaginarnos juntos. 📸',
  '¿Estudias medicina? Porque tienes una cara que cura. 💊',
  'Si te pudiera regalar una rosa, te regalaría todo el jardín. 🌹',
  'Dios se tomó su tiempo cuando te hizo. ⏳',
  '¿Eres un imán? Porque me atraes. 🧲',
  'Contigo hasta el infinito y más allá. 🌌',
  'Tu sonrisa ilumina más que mi pantalla a las 3am. 📱',
  'Si me dieran un deseo, pediría un café contigo. ☕',
  'Eres como el WiFi: no puedo vivir sin ti. 📶',
  'No eres Google, pero tienes todo lo que busco. 🔍',
  'Si fueras una estrella, serías la más brillante. ⭐',
  'Contigo, hasta el lunes me sabe a viernes. 🎉',
  'No eres una ecuación, pero tienes la solución a todo. ➗',
  'Eres la razón por la que creo en el amor a primera vista. 💘',
  'Si el amor fuera ciego, tú serías mi bastón. 👓'
]

export default {
  name: 'piropo',
  aliases: ['flirt', 'amor'],
  description: 'Manda un piropo a alguien',
  usage: '.piropo @user',

  async run({ sock, msg, from, sender }) {
    const target = getTarget(msg) || sender
    const targetNumber = target.split('@')[0]
    const senderNumber = sender.split('@')[0]
    const piropo = PIROPOS[Math.floor(Math.random() * PIROPOS.length)]

    if (target === sender) {
      return await sock.sendMessage(from, {
        text: `😏 *@${senderNumber}* se mandó un piropo a sí mismo:\n\n_${piropo}_`,
        mentions: [sender]
      }, { quoted: msg })
    }

    await sock.sendMessage(from, {
      text: `💘 *@${senderNumber}* le dice a *@${targetNumber}*:\n\n_${piropo}_`,
      mentions: [sender, target]
    }, { quoted: msg })
  }
}
