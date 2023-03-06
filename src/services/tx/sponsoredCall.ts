import { type SafeTransactionData } from '@safe-global/safe-core-sdk-types'

// TODO: import type from relay-service
export type SponsoredCallPayload = {
  chainId: string
  to: string
  data: SafeTransactionData['data'] | undefined
  gasLimit?: string | number
}

const SPONSORED_CALL_URL = 'http://localhost:3001/v1/relay'

export const sponsoredCall = async (tx: SponsoredCallPayload): Promise<{ taskId: string }> => {
  const requestObject: RequestInit = {
    method: 'POST',
    headers: {
      'content-type': 'application/JSON',
    },
    body: JSON.stringify(tx),
  }

  const data = await fetch(SPONSORED_CALL_URL, requestObject).then((res) => {
    if (res.ok) {
      return res.json()
    }
    return res.json().then((data) => {
      throw new Error(`${res.status} - ${res.statusText}: ${data?.error?.message}`)
    })
  })

  return data
}
