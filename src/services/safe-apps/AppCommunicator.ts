import { MutableRefObject } from 'react'
import {
  getSDKVersion,
  SDKMessageEvent,
  MethodToResponse,
  Methods,
  ErrorResponse,
  MessageFormatter,
  RequestId,
} from '@gnosis.pm/safe-apps-sdk'
import { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'
import { Errors, logError } from '../exceptions'

type MessageHandler = (
  msg: SDKMessageEvent,
) => void | MethodToResponse[Methods] | ErrorResponse | Promise<MethodToResponse[Methods] | ErrorResponse | void>

export enum LegacyMethods {
  getEnvInfo = 'getEnvInfo',
}

type SDKMethods = Methods | LegacyMethods

class AppCommunicator {
  private iframeRef: MutableRefObject<HTMLIFrameElement | null>
  private handlers = new Map<SDKMethods, MessageHandler>()
  private app: SafeAppData

  constructor(iframeRef: MutableRefObject<HTMLIFrameElement | null>, app: SafeAppData) {
    this.iframeRef = iframeRef
    this.app = app

    window.addEventListener('message', this.handleIncomingMessage)
  }

  on = (method: SDKMethods, handler: MessageHandler): void => {
    this.handlers.set(method, handler)
  }

  private isValidMessage = (msg: SDKMessageEvent): boolean => {
    if (msg.data.hasOwnProperty('isCookieEnabled')) {
      return true
    }

    const sentFromIframe = this.iframeRef.current?.contentWindow === msg.source
    const knownMethod = Object.values(Methods).includes(msg.data.method)

    return sentFromIframe && knownMethod
  }

  private canHandleMessage = (msg: SDKMessageEvent): boolean => {
    return Boolean(this.handlers.get(msg.data.method))
  }

  send = (data: unknown, requestId: RequestId, error = false): void => {
    const sdkVersion = getSDKVersion()
    const msg = error
      ? MessageFormatter.makeErrorResponse(requestId, data as string, sdkVersion)
      : MessageFormatter.makeResponse(requestId, data, sdkVersion)

    this.iframeRef.current?.contentWindow?.postMessage(msg, '*')
  }

  handleIncomingMessage = async (msg: SDKMessageEvent): Promise<void> => {
    const validMessage = this.isValidMessage(msg)
    const hasHandler = this.canHandleMessage(msg)

    if (validMessage && hasHandler) {
      // TODO: Tracking
      // trackSafeAppMessage({
      //   app: this.app,
      //   method: msg.data.method,
      //   params: msg.data.params,
      //   sdkVersion: msg.data.env.sdkVersion,
      // })

      const handler = this.handlers.get(msg.data.method)
      try {
        // @ts-expect-error Handler existence is checked in this.canHandleMessage
        const response = await handler(msg)

        // If response is not returned, it means the response will be send somewhere else
        if (typeof response !== 'undefined') {
          this.send(response, msg.data.id)
        }
      } catch (err) {
        this.send((err as Error).message, msg.data.id, true)
        logError(Errors._901, (err as Error).message, {
          contexts: {
            safeApp: this.app,
            request: msg.data,
          },
        })
      }
    }
  }

  clear = (): void => {
    window.removeEventListener('message', this.handleIncomingMessage)
  }
}

export default AppCommunicator
