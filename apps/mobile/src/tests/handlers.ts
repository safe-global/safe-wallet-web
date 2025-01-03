import { http, HttpResponse } from 'msw'
import { GATEWAY_URL } from '@/src/config/constants'

export const mockBalanceData = {
  items: [
    {
      tokenInfo: {
        name: 'Ethereum',
        symbol: 'ETH',
        decimals: 18,
        logoUri: 'https://safe-transaction-assets.safe.global/chains/1/chain_logo.png',
      },
      balance: '1000000000000000000',
      fiatBalance: '2000',
    },
  ],
}

export const handlers = [
  http.get(`${GATEWAY_URL.replace(/\/+$/, '')}/v1/chains/:chainId/safes/:safeAddress/balances/USD`, ({ request }) => {
    console.log('Actual request URL:', request.url)
    return HttpResponse.json(mockBalanceData)
  }),
  http.get('https://safe-client.safe.global//v1/chains/1/safes/0x123/balances/USD', () => {
    return HttpResponse.json(mockBalanceData)
  }),
]
