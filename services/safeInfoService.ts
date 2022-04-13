import EventEmitter from "events";
import {getSafeInfo, SafeInfo} from '@gnosis.pm/safe-react-gateway-sdk'
import {GATEWAY_URL, POLLING_INTERVAL} from "config/constants";

export enum SAFE_INFO_EVENTS {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR"
}

type SafeInfoDispatcher = {
  onSuccess: (handler: (data: SafeInfo) => unknown) => void,
  onError: (handler: (error: Error) => unknown) => void,
  unsubscribe: () => void
}

export const initSafeInfoService = (chainId: string, address: string): SafeInfoDispatcher => {
  const eventEmitter = new EventEmitter()
  let timeout: NodeJS.Timeout

  const fetchSafeInfo = async () => {
    try {
      const response = await getSafeInfo(GATEWAY_URL, chainId, address)
      eventEmitter.emit(SAFE_INFO_EVENTS.SUCCESS, response)
    } catch (err) {
      eventEmitter.emit(SAFE_INFO_EVENTS.ERROR, err)
    }
    timeout = setTimeout(fetchSafeInfo, POLLING_INTERVAL)
  }

  const onSuccess = (handler: (data: SafeInfo) => unknown): void => {
    eventEmitter.addListener(SAFE_INFO_EVENTS.SUCCESS, handler)
  }

  const onError = (handler: (error: Error) => unknown): void => {
    eventEmitter.addListener(SAFE_INFO_EVENTS.ERROR, handler)
  }

  const unsubscribe = () => {
    clearTimeout(timeout)
    eventEmitter.removeAllListeners()
  }

  fetchSafeInfo()

  return {
    onSuccess,
    onError,
    unsubscribe
  }
}
