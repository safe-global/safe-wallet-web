import EventEmitter from "events";
import { getSafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import {GATEWAY_URL, POLLING_INTERVAL} from "utils/constants";

export enum SAFE_INFO_EVENTS {
  SUCCESS = "SUCCESS",
  ERROR = "ERROR"
}

export const initSafeInfoService = (chainId: string, address: string): EventEmitter => {
  const eventEmitter = new EventEmitter()

  const fetchSafeInfo = async () => {
    try {
      const response = await getSafeInfo(GATEWAY_URL, chainId, address)
      eventEmitter.emit(SAFE_INFO_EVENTS.SUCCESS, response)
    } catch (err) {
      eventEmitter.emit(SAFE_INFO_EVENTS.ERROR, err)
    }
  }

  fetchSafeInfo()
  setInterval(fetchSafeInfo, POLLING_INTERVAL)

  return eventEmitter
}