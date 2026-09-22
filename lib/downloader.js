import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import os from 'os'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const execAsync = promisify(exec)

// Rutas relativas (funcionan en Windows/Linux/Mac/Termux)
const COOKIES_PATH = path.join(__dirname, '..', 'cookies.txt')
const CACHE_DIR = path.join(__dirname, '..', 'yt-cache')

// Crear carpeta de cache si no existe
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true })
}

// Normalizar rutas para yt-dlp (barras invertidas → barras normales)
function normalizePath(p) {
  return p.replace(/\\/g, '/')
}

// Generar nombre temporal único
function generateTempBase(prefix = 'dl') {
  return path.join(os.tmpdir(), `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`)
}

// ============================================
// DESCARGA DE AUDIO (MP3)
// ============================================
export async function downloadAudio(url, options = {}) {
  const {
    timeout = 300000,
    maxBuffer = 1024 * 1024 * 100,
    onProgress = null
  } = options

  const tmpBase = generateTempBase('audio')
  const mp3Path = `${tmpBase}.mp3`

  const cmd = `yt-dlp --js-runtimes node --cookies "${normalizePath(COOKIES_PATH)}" --cache-dir "${normalizePath(CACHE_DIR)}" --downloader aria2c --downloader-args "aria2c:--http-accept-gzip=false --disable-ipv6=true" -x --audio-format mp3 --no-playlist -o "${normalizePath(tmpBase)}.%(ext)s" "${url}"`

  if (onProgress) onProgress('Iniciando descarga de audio...')

  await execAsync(cmd, { maxBuffer, timeout })

  if (!fs.existsSync(mp3Path)) {
    throw new Error('No se pudo generar el archivo MP3')
  }

  const buffer = fs.readFileSync(mp3Path)

  try { fs.unlinkSync(mp3Path) } catch {}

  return { buffer, path: mp3Path }
}

// ============================================
// DESCARGA GENÉRICA (TikTok, IG, Twitter, etc.)
// ============================================
export async function downloadGeneric(url, options = {}) {
  const {
    timeout = 300000,
    maxBuffer = 1024 * 1024 * 200,
    onProgress = null
  } = options

  const tmpBase = generateTempBase('media')

  const cmd = `yt-dlp --js-runtimes node --cookies "${normalizePath(COOKIES_PATH)}" --cache-dir "${normalizePath(CACHE_DIR)}" --downloader aria2c --downloader-args "aria2c:--http-accept-gzip=false --disable-ipv6=true" --no-playlist -o "${normalizePath(tmpBase)}.%(ext)s" "${url}"`

  if (onProgress) onProgress('Iniciando descarga...')

  await execAsync(cmd, { maxBuffer, timeout })

  const files = fs.readdirSync(os.tmpdir()).filter(f => f.startsWith(path.basename(tmpBase)))

  if (files.length === 0) {
    throw new Error('No se pudo descargar el archivo')
  }

  const mediaFile = files[0]
  const mediaPath = path.join(os.tmpdir(), mediaFile)
  const buffer = fs.readFileSync(mediaPath)

  const ext = path.extname(mediaFile).toLowerCase()
  let type = 'document'
  if (['.mp4', '.webm', '.mkv', '.mov'].includes(ext)) type = 'video'
  else if (['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) type = 'image'
  else if (['.mp3', '.m4a', '.opus', '.ogg'].includes(ext)) type = 'audio'

  for (const file of files) {
    try { fs.unlinkSync(path.join(os.tmpdir(), file)) } catch {}
  }

  return { buffer, type, ext }
}

// ============================================
// BUSCAR EN YOUTUBE
// ============================================
export async function searchYouTube(query) {
  const yts = (await import('yt-search')).default

  if (/^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(query)) {
    const videoId = extractVideoId(query)
    const result = await yts({ videoId })
    return {
      url: query,
      title: result.title,
      duration: result.timestamp,
      thumbnail: result.thumbnail
    }
  }

  const result = await yts(query)
  const video = result.videos?.[0]

  if (!video) return null

  return {
    url: video.url,
    title: video.title,
    duration: video.timestamp,
    thumbnail: video.thumbnail
  }
}

// Helper: extraer videoId de una URL de YouTube
function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)
  return match ? match[1] : null
}

// ============================================
// HELPERS DE FORMATO
// ============================================
export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  return `${m}:${s.toString().padStart(2, '0')}`
}
