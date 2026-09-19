// Verifica si un usuario es admin del grupo
export async function isAdmin(sock, groupId, userId) {
  try {
    const metadata = await sock.groupMetadata(groupId)
    const participant = metadata.participants.find(p => p.id === userId)
    return participant?.admin === 'admin' || participant?.admin === 'superadmin'
  } catch {
    return false
  }
}

// Verifica si el bot es admin del grupo
export async function isBotAdmin(sock, groupId) {
  try {
    const metadata = await sock.groupMetadata(groupId)
    const botId = sock.user?.id
    const participant = metadata.participants.find(p => p.id === botId)
    return participant?.admin === 'admin' || participant?.admin === 'superadmin'
  } catch {
    return false
  }
}

// Extrae el JID del objetivo (de mención o del mensaje citado)
export function getTarget(msg) {
  const contextInfo = msg.message?.extendedTextMessage?.contextInfo

  // Buscar mención
  const mentioned = contextInfo?.mentionedJid
  if (mentioned?.length > 0) return mentioned[0]

  // Buscar en el mensaje citado
  const quoted = contextInfo?.participant
  if (quoted) return quoted

  return null
}

// Verifica si es un grupo
export function isGroup(jid) {
  return jid?.endsWith('@g.us')
}
import db from './db.js'

// Obtener el rango del bot de un usuario
export function getRank(userId) {
  return db.getRank(userId)
}

// Verificar si tiene al menos tal rango
export function hasRank(userId, minRank) {
  return db.isAtLeast(userId, minRank)
}

// Extraer el número limpio de un JID
export function cleanNumber(jid) {
  return jid?.split(':')[0]?.split('@')[0]
}
