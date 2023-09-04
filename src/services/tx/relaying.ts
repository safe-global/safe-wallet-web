import { type SafeTransactionData } from '@safe-global/safe-core-sdk-types'
import { IS_PRODUCTION, SAFE_RELAY_SERVICE_URL_PRODUCTION, SAFE_RELAY_SERVICE_URL_STAGING } from '@/config/constants'
import { cgwDebugStorage } from '@/components/sidebar/DebugToggle'

export const SAFE_RELAY_SERVICE_URL =
  IS_PRODUCTION || cgwDebugStorage.get() ? SAFE_RELAY_SERVICE_URL_PRODUCTION : SAFE_RELAY_SERVICE_URL_STAGING

// TODO: import types from relay-service
export type SponsoredCallPayload = {
  chainId: string
  to: string
  data: SafeTransactionData['data']
  gasLimit?: string | number
}
type SponsoredCallResponse = {
  taskId: string
}

export type RelayResponse = {
  limit: number
  remaining: number
}

type ErrorResponse = {
  message: string
  statusCode: number
}

export const sponsoredCall = async (tx: SponsoredCallPayload): Promise<SponsoredCallResponse> => {
  const requestObject: RequestInit = {
    method: 'POST',
    headers: {
      'content-type': 'application/JSON',
    },
    body: JSON.stringify(tx),
  }

  const res = await fetch(SAFE_RELAY_SERVICE_URL, requestObject)

  if (res.ok) {
    return res.json() as Promise<SponsoredCallResponse>
  }

  const errorData: ErrorResponse = await res.json()
  throw new Error(`${res.status} - ${res.statusText}: ${errorData.message}`)
}

export const getRelays = async (chainId: string, address: string): Promise<RelayResponse> => {
  const url = `${SAFE_RELAY_SERVICE_URL}/${chainId}/${address}`

  try {
    const res = await fetch(url)

    if (res.ok) {
      return res.json() as Promise<RelayResponse>
    }

    const errorData: ErrorResponse = await res.json()
    throw new Error(errorData.message)
  } catch (error) {
    throw new Error(`Error fetching relays: ${error}`)
  }
}
