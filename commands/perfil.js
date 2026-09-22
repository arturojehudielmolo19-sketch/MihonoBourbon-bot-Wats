import db from '../lib/db.js'
import { getTarget } from '../lib/permissions.js'

export default {
  name: 'perfil',
  aliases: ['profile', 'yo', 'me'],
  description: 'Muestra el perfil de un usuario',

  async run({ sock, msg, from, sender }) {
    const target = getTarget(msg) || sender
    const targetNumber = target.split('@')[0]

    // Obtener perfil
    const profile = db.getProfile(target)

    // Datos de WhatsApp
    let waName = 'Desconocido'
    let waPhotoUrl = null

    try {
      // Nombre desde el pushName del mensaje
      if (target === sender) {
        waName = msg.pushName || 'Sin nombre'
      }

      // Foto de perfil
      try {
        waPhotoUrl = await sock.profilePictureUrl(target, 'image')
      } catch {
        waPhotoUrl = null
      }
    } catch {}

    // Datos de economía
    const efectivo = db.getMoney(from, target)
    const banco = db.getBank(from, target)
    const total = efectivo + banco

    // Rango del bot
    const rango = db.getRank(target)

    // Advertencias
    const warns = db.getWarns(from, target).length

    // Género
    const generoIcono = {
      'Hombre': '♂️',
      'Mujer': '♀️',
      'Otro': '⚧️',
      'Oculto': '❓'
    }[profile.genero] || '❓'

    // Fecha de registro
    const fecha = new Date(profile.fechaRegistro)
    const fechaStr = fecha.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    // Construir el perfil
    const nombre = profile.nombre || waName
    const edad = profile.edad ? `┃ 🎂 *Edad:* ${profile.edad} años\n` : ''
    const bio = profile.bio ? `┃ 📝 *Bio:* ${profile.bio}\n` : ''
    const genero = profile.genero ? `┃ ${generoIcono} *Género:* ${profile.genero}\n` : ''

    const perfilTexto = `╭━━━〔 👤 *PERFIL* 〕━━━╮
┃
┃ 📛 *Nombre:* ${nombre}
┃ 🔢 *Número:* ${targetNumber}
${genero}${edad}${bio}┃ 👑 *Rango:* ${rango}
┃ ⚠️ *Warns:* ${warns}/3
┃
┃ 💰 *ECONOMÍA*
┃ 💵 Efectivo: *$${efectivo.toLocaleString('es-MX')}*
┃ 🏦 Banco: *$${banco.toLocaleString('es-MX')}*
┃ 💳 Total: *$${total.toLocaleString('es-MX')}*
┃
┃ 📅 *Registro:* ${fechaStr}
┃
╰━━━━━━━━━━━━━━━━━━━╯

> _Configura tu perfil con_ *.setnombre* *.setgenero* *.setbio*`

    // Enviar con foto si existe
    try {
      if (waPhotoUrl) {
        await sock.sendMessage(from, {
          image: { url: waPhotoUrl },
          caption: perfilTexto,
          mentions: [target]
        }, { quoted: msg })
      } else {
        await sock.sendMessage(from, {
          text: perfilTexto,
          mentions: [target]
        }, { quoted: msg })
      }
    } catch (e) {
      console.error('Error perfil:', e.message)
      await sock.sendMessage(from, {
        text: perfilTexto,
        mentions: [target]
      }, { quoted: msg })
    }
  }
}
