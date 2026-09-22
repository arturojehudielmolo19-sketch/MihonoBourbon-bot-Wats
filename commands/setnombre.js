import db from '../lib/db.js'

export default {
  name: 'setnombre',
  aliases: ['nombre', 'name'],
  description: 'Define tu nombre personalizado',
  usage: '.setnombre <nombre>',

  async run({ sock, msg, from, sender, args }) {
    const nombre = args.join(' ').trim()

    if (!nombre) {
      const perfil = db.getProfile(sender)
      return await sock.sendMessage(from, {
        text: `📛 *Tu nombre actual:* ${perfil.nombre || '(no definido)'}\n\n_Usa_ *.setnombre <nombre>* _para cambiarlo._`
      }, { quoted: msg })
    }

    if (nombre.length > 30) {
      return await sock.sendMessage(from, {
        text: '❌ El nombre es muy largo (máximo 30 caracteres).'
      }, { quoted: msg })
    }

    db.setProfileField(sender, 'nombre', nombre)

    await sock.sendMessage(from, {
      text: `✅ Nombre actualizado a: *${nombre}*`
    }, { quoted: msg })
  }
}
