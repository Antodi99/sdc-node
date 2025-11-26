import fs from 'fs/promises'
import path from 'path'
import { dataDir } from '../config/index.js'

function idToPath(id) {
  return path.join(dataDir, `${id}.json`)
}

export async function getNextId() {
  const files = await fs.readdir(dataDir)
  const ids = files
    .filter(f => f.endsWith('.json'))
    .map(f => parseInt(f.replace('.json', '')))
    .filter(Number.isFinite)

  return ids.length ? Math.max(...ids) + 1 : 1
}

export async function readArticle(id) {
  const p = idToPath(id)
  const raw = await fs.readFile(p, 'utf-8')
  const a = JSON.parse(raw)
  if (!Array.isArray(a.attachments)) a.attachments = []
  return a
}

export async function saveArticle(article) {
  const p = idToPath(article.id)
  if (!Array.isArray(article.attachments)) article.attachments = []
  await fs.writeFile(p, JSON.stringify(article, null, 2))
}
