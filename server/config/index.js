import path from 'path'
import { fileURLToPath } from 'url'

const currentFile = fileURLToPath(import.meta.url)
const configDir = path.dirname(currentFile)
const serverDir = path.resolve(configDir, '..')

export const PORT = process.env.PORT
export const ORIGIN = process.env.ORIGIN

export const dataDir = path.join(serverDir, 'data')
export const uploadDir = path.join(serverDir, 'uploads')
