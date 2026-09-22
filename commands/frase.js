const FRASES = [
  'El éxito es la suma de pequeños esfuerzos repetidos día tras día. 💪',
  'No cuentes los días, haz que los días cuenten. ⏳',
  'La mejor manera de predecir el futuro es creándolo. 🚀',
  'El único modo de hacer un gran trabajo es amar lo que haces. ❤️',
  'La disciplina es el puente entre metas y logros. 🌉',
  'No te preocupes por los fracasos, preocúpate por las oportunidades que pierdes al no intentarlo. 🎯',
  'Cada día es una nueva oportunidad para cambiar tu vida. 🌅',
  'La mente es todo. En lo que piensas, te conviertes. 🧠',
  'El momento perfecto nunca llega. Empieza donde estás. ⏰',
  'Si puedes soñarlo, puedes hacerlo. ✨',
  'El dolor que sientes hoy será la fuerza que sientas mañana. 💥',
  'No es sobre ser el mejor, es sobre ser mejor que ayer. 📈',
  'Las grandes cosas nunca vienen de zonas de confort. 🔥',
  'El conocimiento es poder, pero el carácter es más. 👑',
  'Haz hoy lo que otros no quieren, y mañana harás lo que otros no pueden. 💎',
  'Tu única competencia es tu yo del pasado. 🥇',
  'Rodéate de gente que hable de ideas, no de personas. 🧠',
  'La paciencia es amarga, pero sus frutos son dulces. 🍎',
  'No busques el momento perfecto, toma el momento y hazlo perfecto. ⚡',
  'La vida es 10% lo que te pasa y 90% cómo reaccionas. 🌊'
]

export default {
  name: 'frase',
  aliases: ['quote', 'consejo', 'motivacion'],
  description: 'Manda una frase aleatoria',

  async run({ sock, msg, from }) {
    const frase = FRASES[Math.floor(Math.random() * FRASES.length)]

    await sock.sendMessage(from, {
      text: `💭 *Frase del día*\n\n_${frase}_`
    }, { quoted: msg })
  }
}
