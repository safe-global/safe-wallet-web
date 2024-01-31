import { type Eip1193Provider } from 'ethers'
import { type SafeWalletProvider } from '.'

export class SafeRpcProvider implements Eip1193Provider {
  walletProvider: SafeWalletProvider

  constructor(walletProvider: SafeWalletProvider) {
    this.walletProvider = walletProvider
  }

  async request(request: { method: string; params?: Array<any> | Record<string, any> }): Promise<any> {
    if (request.method === 'eth_requestAccounts') {
      request.method = 'eth_accounts'
    }
    const response = await this.walletProvider.request(0, request, {
      id: -1,
      url: '',
      name: 'Built-inswap',
      description: 'description',
      iconUrl: 'icon',
    })

    if ('result' in response) {
      return response.result
    }
  }

  async on() {
    console.log('swap on =============================')
  }

  async enable() {
    await this.walletProvider.eth_accounts()
  }
}
