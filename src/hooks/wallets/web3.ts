import { RPC_AUTHENTICATION, type ChainInfo, type RpcUri } from '@safe-global/safe-gateway-typescript-sdk'
import { INFURA_TOKEN, SAFE_APPS_INFURA_TOKEN } from '@/config/constants'
import { type EIP1193Provider } from '@web3-onboard/core'
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers'
import ExternalStore from '@/services/ExternalStore'
import type { providers, utils } from 'ethers'
import { BigNumber, Contract } from 'ethers'
import * as gasPriceMinimumInfo from '@/contracts/gas_price_minimum'
import * as blockchainParametersInfo from '@/contracts/blockchain_parameters'

class CeloJsonRpcProvider extends JsonRpcProvider {
  constructor(url?: utils.ConnectionInfo | string, network?: providers.Networkish) {
    super(url, network)

    // Override certain block formatting properties that don't exist on Celo blocks
    // Reaches into https://github.com/ethers-io/ethers.js/blob/master/packages/providers/src.ts/formatter.ts
    const blockFormat = this.formatter.formats.block
    blockFormat.gasLimit = () => BigNumber.from(0)
    blockFormat.nonce = () => ''
    blockFormat.difficulty = () => 0
  }

  async getGasPrice(): Promise<BigNumber> {
    await this.getNetwork()

    const result = await this.perform('getGasPrice', {})
    try {
      return BigNumber.from(result)
    } catch (error) {
      throw error
    }
  }

  async getFeeData(): Promise<any> {
    const { block, gasPrice } = {
      block: await this.getBlock('latest'),
      gasPrice: await this.getGasPrice().catch((error) => {
        // @TODO: Why is this now failing on Calaveras?
        //console.log(error);
        return null
      }),
    }

    let lastBaseFeePerGas = null,
      maxFeePerGas = null,
      maxPriorityFeePerGas = null

    const gasPriceMinimumContract = new Contract(gasPriceMinimumInfo.proxyAddress, gasPriceMinimumInfo.ABI, this)
    const blockchainParametersContract = new Contract(
      blockchainParametersInfo.proxyAddress,
      blockchainParametersInfo.ABI,
      this,
    )
    const gasPriceMinimum: BigNumber = await gasPriceMinimumContract.getGasPriceMinimum(
      '0x471EcE3750Da237f93B8E339c536989b8978a438',
    ) // TODO: replace GoldToken address

    // TODO: try to use getUpdatedGasPriceMinimum(uint256 blockGasTotal, uint256 blockGasLimit) instead

    // if (block && block.baseFeePerGas) {
    //   // We may want to compute this more accurately in the future,
    //   // using the formula "check if the base fee is correct".
    //   // See: https://eips.ethereum.org/EIPS/eip-1559
    //   lastBaseFeePerGas = block.baseFeePerGas
    //   maxPriorityFeePerGas = BigNumber.from('1500000000')
    //   maxFeePerGas = block.baseFeePerGas.mul(2).add(maxPriorityFeePerGas)
    // }

    return { lastBaseFeePerGas, maxFeePerGas, maxPriorityFeePerGas, gasPrice: gasPriceMinimum }
  }

  async estimateGas(transaction: utils.Deferrable<providers.TransactionRequest>) {
    await this.getNetwork()
    const params = {
      transaction: await this._getTransactionRequest(transaction),
    }

    const result = await this.perform('estimateGas', params)
    try {
      return BigNumber.from(result)
    } catch (error) {
      throw error
    }
  }
}

// RPC helpers
const formatRpcServiceUrl = ({ authentication, value }: RpcUri, TOKEN: string): string => {
  const needsToken = authentication === RPC_AUTHENTICATION.API_KEY_PATH
  return needsToken ? `${value}${TOKEN}` : value
}

export const getRpcServiceUrl = (rpcUri: RpcUri): string => {
  return formatRpcServiceUrl(rpcUri, INFURA_TOKEN)
}

export const createWeb3ReadOnly = ({ rpcUri }: ChainInfo): JsonRpcProvider => {
  return new CeloJsonRpcProvider({ url: getRpcServiceUrl(rpcUri), timeout: 10_000 })
}

export const createWeb3 = (walletProvider: EIP1193Provider): Web3Provider => {
  return new Web3Provider(walletProvider)
}

export const createSafeAppsWeb3Provider = ({ safeAppsRpcUri }: ChainInfo): JsonRpcProvider => {
  return new CeloJsonRpcProvider({ url: formatRpcServiceUrl(safeAppsRpcUri, SAFE_APPS_INFURA_TOKEN), timeout: 10_000 })
}

export const { getStore: getWeb3, setStore: setWeb3, useStore: useWeb3 } = new ExternalStore<Web3Provider>()

export const {
  getStore: getWeb3ReadOnly,
  setStore: setWeb3ReadOnly,
  useStore: useWeb3ReadOnly,
} = new ExternalStore<CeloJsonRpcProvider>()

export const getUserNonce = async (userAddress: string): Promise<number> => {
  const web3 = getWeb3ReadOnly()
  if (!web3) return -1
  try {
    return await web3.getTransactionCount(userAddress, 'pending')
  } catch (error) {
    return Promise.reject(error)
  }
}
