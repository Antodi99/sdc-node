import fs from 'fs/promises'
import { uploadDir } from '../config/index.js'

export async function ensureDirs() {
  await fs.mkdir(uploadDir, { recursive: true })
}
