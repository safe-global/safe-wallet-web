import { IS_PRODUCTION } from '@/config/constants'
import { LOCAL_STORAGE_DATA } from './common'
import { createIframe, receiveMessage, sendMessage } from './iframe'

const IFRAME_HOST = IS_PRODUCTION ? 'https://gnosis-safe.io' : 'https://safe-team.dev.gnosisdev.com'
const IFRAME_PATH = '/migrate.html'

enum MessageType {
  MigrationData = 'migration-data',
}

type MigrationMessage = {
  type: MessageType.MigrationData
  payload: LOCAL_STORAGE_DATA
}

const isMigrationMessage = (message: any): message is MigrationMessage => {
  return !!message && message.type === MessageType.MigrationData
}

/**
 * Create and an iframe and subscribe to the message from it
 */
const createMigrationBus = (onMessage: (message: LOCAL_STORAGE_DATA) => void) => {
  // Create iframe
  const iframe = createIframe(`${IFRAME_HOST}${IFRAME_PATH}`)

  // Subscribe to the message from iframe
  const unsub = receiveMessage((message) => {
    if (isMigrationMessage(message)) {
      iframe.remove()
      unsub()
      onMessage(message.payload)
    }
  }, IFRAME_HOST)

  // Send a message to the iframe so that it knows where to respond
  sendMessage(iframe, 'ready', IFRAME_HOST)
}

export default createMigrationBus
