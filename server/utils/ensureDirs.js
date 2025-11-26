import fs from 'fs/promises'
import { dataDir, uploadDir } from '../config/index.js'

export async function ensureDirs() {
  await fs.mkdir(dataDir, { recursive: true })
  await fs.mkdir(uploadDir, { recursive: true })
}
