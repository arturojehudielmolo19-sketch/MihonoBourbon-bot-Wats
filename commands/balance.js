import db from '../lib/db.js'
import { getTarget } from '../lib/permissions.js'

export default {
  name: 'balance',
  aliases: ['saldo', 'dinero', 'money', 'bal'],
  description: 'Muestra tu saldo o el de alguien',

  async run({ sock, msg, from, sender }) {
    const target = getTarget(msg) || sender
    const cash = db.getMoney(target)
    const bank = db.getBank(target)
    const total = cash + bank
    const targetNumber = target.split('@')[0]

    await sock.sendMessage(from, {
      text: `💳 *Balance de @${targetNumber}*\n\n💵 Efectivo: *$${cash.toLocaleString('es-MX')}*\n🏦 Banco: *$${bank.toLocaleString('es-MX')}*\n\n💰 *Total: $${total.toLocaleString('es-MX')}*`,
      mentions: [target]
    }, { quoted: msg })
  }
}
