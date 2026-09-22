import db from '../lib/db.js'

export default {
  name: 'setbio',
  aliases: ['bio', 'descripcion'],
  description: 'Define tu biografía',
  usage: '.setbio <texto>',

  async run({ sock, msg, from, sender, args }) {
    const bio = args.join(' ').trim()

    if (!bio) {
      const perfil = db.getProfile(sender)
      return await sock.sendMessage(from, {
        text: `📝 *Tu bio actual:* ${perfil.bio || '(no definida)'}\n\n_Usa_ *.setbio <texto>* _para cambiarla._\n_Usa_ *.setbio clear* _para borrarla._`
      }, { quoted: msg })
    }

    if (bio.toLowerCase() === 'clear' || bio.toLowerCase() === 'borrar') {
      db.setProfileField(sender, 'bio', null)
      return await sock.sendMessage(from, {
        text: '✅ Bio eliminada.'
      }, { quoted: msg })
    }

    if (bio.length > 100) {
      return await sock.sendMessage(from, {
        text: '❌ La bio es muy larga (máximo 100 caracteres).'
      }, { quoted: msg })
    }

    db.setProfileField(sender, 'bio', bio)

    await sock.sendMessage(from, {
      text: `✅ Bio actualizada:\n\n_${bio}_`
    }, { quoted: msg })
  }
}
