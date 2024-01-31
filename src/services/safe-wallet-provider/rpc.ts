import { type Eip1193Provider } from 'ethers'
import { type SafeWalletProvider } from '.'

export class SafeRpcProvider implements Eip1193Provider {
  walletProvider: SafeWalletProvider

  constructor(walletProvider: SafeWalletProvider) {
    this.walletProvider = walletProvider
  }

  async connect(): Promise<void> {
    console.log('connnnneeeeect =====================')
    return
  }

  async request(request: { method: string; params?: Array<any> | Record<string, any> }): Promise<any> {
    console.log('SWAP request =============================', request)
    if (request.method === 'eth_requestAccounts') {
      console.log(
        'swap request eth_requestAccounts =============================',
        await this.walletProvider.eth_accounts(),
      )

      request.method = 'eth_accounts'
      // return await walletProvider.eth_accounts()[0]
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
    console.log('swap enable =============================', (await this.walletProvider.eth_accounts())[0])
    await this.walletProvider.eth_accounts()
  }
}
