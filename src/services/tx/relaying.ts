import { relayTransaction as _relayTransaction } from '@safe-global/safe-gateway-typescript-sdk'

import { getWeb3ReadOnly } from '@/hooks/wallets/web3'

export async function relayTransaction(
  chainId: string,
  body: { version: string; to: string; data: string; gasLimit: string | undefined },
) {
  /**
   * Ensures `gasLimit` is estimate so 150k execution overhead buffer can be added by CGW.
   *
   * @see https://github.com/safe-global/safe-client-gateway/blob/b7640ed4bd7416ecb7696d21ba105fcb5af52a10/src/datasources/relay-api/gelato-api.service.ts#L62-L75
   *
   * - If provided, CGW adds a 150k buffer before submission to Gelato.
   * - If not provided, no buffer is added, and Gelato estimates the it.
   *
   * Note: particularly important on networks like Arbitrum, where estimation is unreliable.
   */
  if (!body.gasLimit) {
    const provider = getWeb3ReadOnly()

    body.gasLimit = await provider
      ?.estimateGas(body)
      .then(String)
      .catch(() => undefined)
  }

  return _relayTransaction(chainId, body)
}
