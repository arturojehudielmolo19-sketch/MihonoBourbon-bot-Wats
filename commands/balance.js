import db from '../lib/db.js'
import { getTarget } from '../lib/permissions.js'

export default {
  name: 'balance',
  aliases: ['saldo', 'dinero', 'money', 'bal'],
  description: 'Muestra tu saldo o el de alguien',

  async run({ sock, msg, from, sender }) {
    const target = getTarget(msg) || sender
    const cash = db.getMoney(from, target)
    const bank = db.getBank(from, target)
    const total = cash + bank
    const targetNumber = target.split('@')[0]

    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    await sock.sendMessage(from, {
      text: `💳 *Balance de @${targetNumber}*\n\n💵 Efectivo: *${simbolo} ${cash.toLocaleString('es-MX')}* ${moneda}\n🏦 Banco: *${simbolo} ${bank.toLocaleString('es-MX')}* ${moneda}\n\n💰 *Total: ${simbolo} ${total.toLocaleString('es-MX')}* ${moneda}`,
      mentions: [target]
    }, { quoted: msg })
  }
}
