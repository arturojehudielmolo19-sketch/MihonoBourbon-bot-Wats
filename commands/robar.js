import db from '../lib/db.js'
import { getTarget, isGroup } from '../lib/permissions.js'

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

    const config = db.economyConfig.robar
    const COOLDOWN = config.cooldownMinutos * 60 * 1000
    const simbolo = db.getMonedaSimbolo()
    const moneda = db.getMonedaNombre()

    const lastRob = db.getCooldown(from, sender, 'Rob')
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

    const targetCash = db.getMoney(from, target)

    if (targetCash < 100) {
      return await sock.sendMessage(from, {
        text: `💸 @${targetNumber} no tiene suficiente efectivo para robar.\n\n_Solo tiene ${simbolo} ${targetCash} en efectivo._`,
        mentions: [target]
      }, { quoted: msg })
    }

    // Verificar si el objetivo tiene escudo
    if (db.hasEffect(target, 'escudo')) {
      db.setCooldown(from, sender, 'Rob', now)
      db.consumeEffect(target, 'escudo')

      return await sock.sendMessage(from, {
        text: `🛡️ *¡ESCUDO ACTIVADO!*\n\n@${targetNumber} estaba protegido y bloqueó el robo de @${senderNumber}\n\n_El escudo fue consumido._`,
        mentions: [target, sender]
      }, { quoted: msg })
    }

    db.setCooldown(from, sender, 'Rob', now)

    const exito = Math.random() < config.probabilidadExito

    if (exito) {
      const porcentaje = 0.1 + Math.random() * 0.3
      const robado = Math.floor(targetCash * porcentaje)

      db.addMoney(from, target, -robado)
      db.addMoney(from, sender, robado)

      await sock.sendMessage(from, {
        text: `🦹 *¡ROBO EXITOSO!*\n\n@${senderNumber} le robó *${simbolo} ${robado.toLocaleString('es-MX')}* ${moneda} a @${targetNumber}\n\n💰 Tu nuevo saldo: *${simbolo} ${db.getMoney(from, sender).toLocaleString('es-MX')}*`,
        mentions: [sender, target]
      }, { quoted: msg })
    } else {
      const multa = Math.floor(db.getMoney(from, sender) * config.multaFallidaPorcentaje)
      db.addMoney(from, sender, -multa)

      await sock.sendMessage(from, {
        text: `🚔 *¡TE ATRAPARON!*\n\n@${senderNumber} intentó robar a @${targetNumber} pero la policía lo atrapó.\n\n💸 Multa: *${simbolo} ${multa.toLocaleString('es-MX')}* ${moneda}\n💰 Tu saldo: *${simbolo} ${db.getMoney(from, sender).toLocaleString('es-MX')}*`,
        mentions: [sender, target]
      }, { quoted: msg })
    }
  }
}
