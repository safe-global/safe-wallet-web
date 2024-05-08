import type { SafeTransactionData } from '@safe-global/safe-core-sdk-types'

const API_HOST = 'https://blockaid-proxy.ivan-dbc.workers.dev'

/** @see https://docs.blockaid.io/docs/supported-chains */
const API_CHAINS: Record<string, string> = {
  1: 'ethereum',
  56: 'bsc',
  137: 'polygon',
  10: 'optimism',
  42161: 'arbitrum',
  43114: 'avalanche',
  8453: 'base',
  238: 'blast',
  59144: 'linea',
  7777777: 'zora',
}

enum API_ENDPOINTS {
  valiteTransaction = '/v0/validate/transaction',
}

const toHex = (value: string) => {
  return '0x' + parseInt(value).toString(16)
}

export async function validateTransaction(
  chainId: number,
  accountAddress: string,
  txData: SafeTransactionData,
  domain: string,
) {
  if (!(chainId in API_CHAINS)) {
    throw new Error(`Chain ${chainId} not supported`)
  }

  const url = `${API_HOST}/${API_CHAINS[chainId]}${API_ENDPOINTS.valiteTransaction}`

  const options = {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      options: ['validation', 'simulation'],
      data: {
        from: accountAddress,
        to: txData.to,
        value: toHex(txData.value),
        data: txData.data,
        gas: toHex(txData.baseGas),
        gas_price: toHex(txData.gasPrice),
      },
      metadata: { domain },
      account_address: accountAddress,
    }),
  }

  const resp = await fetch(url, options)
  return resp.json()
}
