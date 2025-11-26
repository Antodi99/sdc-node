import { Server } from 'socket.io'
import { ORIGIN } from '../config/index.js'

export function createIO(server) {
  return new Server(server, {
    cors: { origin: ORIGIN },
    transports: ['websocket'],
    allowUpgrades: false
  })
}
