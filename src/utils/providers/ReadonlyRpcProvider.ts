import { JsonRpcProvider } from 'ethers'
import { numberToHex } from '../hex'

class ReadonlyRpcProvider extends JsonRpcProvider {
  #chainId: string
  constructor(chainId: string, url: string) {
    super(url)
    this.#chainId = chainId
  }

  async send(method: string, params: Array<any> | Record<string, any>): Promise<any> {
    // The readonly provider always has the same chainId, no need to forward this request to the endpoint
    console.log('RPC Request', method, method === 'eth_chainId')
    if (method === 'eth_chainId') {
      console.log('Responding immediately')
      return numberToHex(Number(this.#chainId))
    }

    return await super.send(method, params)
  }
}

export default ReadonlyRpcProvider
