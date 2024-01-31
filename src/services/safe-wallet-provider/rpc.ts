import { type Eip1193Provider } from 'ethers'
import { AppInfo, type SafeWalletProvider } from '.'
import { EIP712TypedData } from '@1inch/fusion-sdk/limit-order'

const appInfo = {
  id: 1,
  url: '',
  name: 'Built-inswap',
  description: 'description',
  iconUrl: 'icon',
}
export class SafeRpcProvider implements Eip1193Provider {
  walletProvider: SafeWalletProvider

  constructor(walletProvider: SafeWalletProvider) {
    this.walletProvider = walletProvider
  }
  // async eth_signTypedData(address: string, typedData: unknown, appInfo: AppInfo): Promise<string> {
  // signTypedData(walletAddress: string, typedData: EIP712TypedData): Promise<string>;
  // ethCall(contractAddress: string, callData: string): Promise<string>;
    async signTypedData(walletAddress, typedData): Promise<string> {
    console.log('signTypedData =============================', walletAddress, typedData)
    return this.walletProvider.eth_signTypedData(walletAddress, typedData, appInfo)
  }

  async ethCall(contractAddress: string, callData: string): Promise<string> {
    console.log('ethCall =============================', contractAddress, callData)
    // return this.walletProvider.eth_call({ to: contractAddress, data: callData }, 'latest')
  }

  async request(request: { method: string; params?: Array<any> | Record<string, any> }): Promise<any> {
    if (request.method === 'eth_requestAccounts') {
      request.method = 'eth_accounts'
    }
    const response = await this.walletProvider.request(0, request, appInfo)

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
