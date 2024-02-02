import { type Eip1193Provider } from 'ethers'
import { type SafeWalletProvider } from '.'

export class SafeRpcProvider implements Eip1193Provider {
  walletProvider: SafeWalletProvider

  constructor(walletProvider: SafeWalletProvider) {
    this.walletProvider = walletProvider
  }

  async request(request: { method: string; params?: Array<any> | Record<string, any> }): Promise<any> {
    console.log('========== request', request)
    if (request.method === 'eth_requestAccounts') {
      request.method = 'eth_accounts'
    }
    const response = await this.walletProvider.request(0, request, {
      id: -1,
      url: '',
      name: 'Built-in swap',
      description: 'description',
      iconUrl: 'icon',
    })

    console.log('========== response', response)

    if ('result' in response) {
      return response.result
    }
  }

  async lookupAddress(address: string): Promise<string> {
    return address
  }
  async getBlockNumber() {
    console.log('========== getBlockNumber')
    // return this.walletProvider.eth_blockNumber()
    const request = {
      method: 'eth_blockNumber',
      params: [],
    }
    const response = await this.walletProvider.request(0, request, {
      id: -1,
      url: '',
      name: 'Built-in swap',
      description: 'description',
      iconUrl: 'icon',
    })

    console.log('========== getblocknumber', response)

    if ('result' in response) {
      return response.result
    }
  }
  async on() {
    console.log('swap on =============================')
  }

  async off() {
    console.log('swap off =============================')
  }

  async enable() {
    await this.walletProvider.eth_accounts()
  }
}
