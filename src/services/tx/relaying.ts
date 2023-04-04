import { type SafeTransactionData } from '@safe-global/safe-core-sdk-types'
import { IS_PRODUCTION, SAFE_RELAY_SERVICE_URL_PRODUCTION, SAFE_RELAY_SERVICE_URL_STAGING } from '@/config/constants'
import { cgwDebugStorage } from '@/components/sidebar/DebugToggle'

export const SAFE_RELAY_SERVICE_URL =
  IS_PRODUCTION || cgwDebugStorage.get() ? SAFE_RELAY_SERVICE_URL_PRODUCTION : SAFE_RELAY_SERVICE_URL_STAGING

// TODO: import type from relay-service
export type SponsoredCallPayload = {
  chainId: string
  to: string
  data: SafeTransactionData['data']
  gasLimit?: string | number
}

export const sponsoredCall = async (tx: SponsoredCallPayload): Promise<{ taskId: string }> => {
  const requestObject: RequestInit = {
    method: 'POST',
    headers: {
      'content-type': 'application/JSON',
    },
    body: JSON.stringify(tx),
  }

  const res = await fetch(SAFE_RELAY_SERVICE_URL, requestObject)

  if (res.ok) {
    return res.json()
  }

  const errorData: { error?: { message: string } } = await res.json()
  throw new Error(`${res.status} - ${res.statusText}: ${errorData?.error?.message}`)
}

export const getRemainingRelays = async (chainId: string, address: string): Promise<number> => {
  const url = `${SAFE_RELAY_SERVICE_URL}/${chainId}/${address}`

  try {
    const res = await fetch(url)

    if (res.ok) {
      const data = await res.json()
      return data.remaining
    }

    const errorData: { error?: { message: string } } = await res.json()
    throw new Error(errorData?.error?.message || 'Unknown error')
  } catch (error) {
    throw new Error(`Error fetching remaining relays: ${error}`)
  }
}
