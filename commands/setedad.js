import db from '../lib/db.js'

export default {
  name: 'setedad',
  aliases: ['edad', 'age'],
  description: 'Define tu edad',
  usage: '.setedad <número>',

  async run({ sock, msg, from, sender, args }) {
    const edad = parseInt(args[0])

    if (!args[0]) {
      const perfil = db.getProfile(sender)
      return await sock.sendMessage(from, {
        text: `🎂 *Tu edad actual:* ${perfil.edad || '(no definida)'}\n\n_Usa_ *.setedad <número>* _para cambiarla._`
      }, { quoted: msg })
    }

    if (!edad || edad < 10 || edad > 100) {
      return await sock.sendMessage(from, {
        text: '❌ Edad inválida (debe ser entre 10 y 100).'
      }, { quoted: msg })
    }

    db.setProfileField(sender, 'edad', edad)

    await sock.sendMessage(from, {
      text: `✅ Edad actualizada: *${edad} años*`
    }, { quoted: msg })
  }
}
