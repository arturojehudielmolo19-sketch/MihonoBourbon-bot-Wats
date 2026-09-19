import db from '../lib/db.js'
import { getTarget, isGroup } from '../lib/permissions.js'

const COOLDOWN = 1000 * 60 * 5 // 5 minutos

export default {
  name: 'robar',
  aliases: ['steal', 'roba'],
  description: 'Intenta robar dinero a otro usuario',
  groupOnly: true,

  async run({ sock, msg, from, sender }) {
    if (!isGroup(from)) {
      return await sock.sendMessage(from, {
        text: '❌ Este comando solo funciona en grupos.'
      }, { quoted: msg })
    }

    const lastRob = db.getCooldown(sender, 'Rob')
    const now = Date.now()

    if (now - lastRob < COOLDOWN) {
      const remaining = COOLDOWN - (now - lastRob)
      const min = Math.floor(remaining / 60000)
      const seg = Math.floor((remaining % 60000) / 1000)
      return await sock.sendMessage(from, {
        text: `🚔 La policía te está vigilando. Espera *${min}m ${seg}s*.`
      }, { quoted: msg })
    }

    const target = getTarget(msg)
    if (!target) {
      return await sock.sendMessage(from, {
        text: '❌ Menciona a alguien o responde a su mensaje.'
      }, { quoted: msg })
    }

    if (target === sender) {
      return await sock.sendMessage(from, {
        text: '❌ No puedes robarte a ti mismo.'
      }, { quoted: msg })
    }

    const senderNumber = sender.split('@')[0]
    const targetNumber = target.split('@')[0]

    // Solo se puede robar el EFECTIVO (no el banco)
    const targetCash = db.getMoney(target)

    if (targetCash < 100) {
      return await sock.sendMessage(from, {
        text: `💸 @${targetNumber} no tiene suficiente efectivo para robar.\n\n_Solo tiene $${targetCash} en efectivo._`,
        mentions: [target]
      }, { quoted: msg })
    }

    db.setCooldown(sender, 'Rob', now)

    // 40% de éxito, 60% de fracaso
    const exito = Math.random() < 0.4

    if (exito) {
      // Roba entre 10% y 40% del efectivo
      const porcentaje = 0.1 + Math.random() * 0.3
      const robado = Math.floor(targetCash * porcentaje)

      db.addMoney(target, -robado)
      db.addMoney(sender, robado)

      await sock.sendMessage(from, {
        text: `🦹 *¡ROBO EXITOSO!*\n\n@${senderNumber} le robó *$${robado}* a @${targetNumber}\n\n💰 Tu nuevo saldo: *$${db.getMoney(sender)}*`,
        mentions: [sender, target]
      }, { quoted: msg })
    } else {
      // Falla: paga una multa del 15% de su efectivo
      const multa = Math.floor(db.getMoney(sender) * 0.15)
      db.addMoney(sender, -multa)

      await sock.sendMessage(from, {
        text: `🚔 *¡TE ATRAPARON!*\n\n@${senderNumber} intentó robar a @${targetNumber} pero la policía lo atrapó.\n\n💸 Multa: *$${multa}*\n💰 Tu saldo: *$${db.getMoney(sender)}*`,
        mentions: [sender, target]
      }, { quoted: msg })
    }
  }
}
