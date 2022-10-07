import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import type { FeeData } from '@ethersproject/providers'
import type { GasPrice, GasPriceOracle } from '@gnosis.pm/safe-react-gateway-sdk'
import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { GAS_PRICE_TYPE } from '@gnosis.pm/safe-react-gateway-sdk'
import type { JsonRpcProvider } from '@ethersproject/providers'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from './useChains'
import useIntervalCounter from './useIntervalCounter'
import { useWeb3ReadOnly } from '../hooks/wallets/web3'
import { hasFeature } from '@/utils/chains'
import { Errors, logError } from '@/services/exceptions'

// Updat gas fees every 20 seconds
const REFRESH_DELAY = 20e3

// Loop over the oracles and return the first one that works.
// Or return a fixed value if specified.
// If none of them work, throw an error.
const fetchGasOracle = async (gasPriceOracle: GasPriceOracle): Promise<BigNumber> => {
  const { uri, gasParameter, gweiFactor } = gasPriceOracle
  const response = await fetch(uri)
  if (!response.ok) {
    throw new Error(`Error fetching gas price from oracle ${uri}`)
  }

  const json = await response.json()
  const data = json.data || json.result || json
  return BigNumber.from(data[gasParameter] * Number(gweiFactor))
}

const getGasPrice = async (gasPriceConfigs: GasPrice): Promise<BigNumber | undefined> => {
  let error: Error | undefined

  for (const config of gasPriceConfigs) {
    if (config.type == GAS_PRICE_TYPE.FIXED) {
      return BigNumber.from(config.weiValue)
    }

    if (config.type == GAS_PRICE_TYPE.ORACLE) {
      try {
        return await fetchGasOracle(config)
      } catch (err) {
        error = err as Error
        logError(Errors._611, error.message)
        // Continue to the next oracle
        continue
      }
    }
  }

  // If everything failed, throw the last error or return undefined
  if (error) {
    throw error
  }
}

// Get the fee data from the blockchain.
// Ethers.js always returns 1.5 gwei for maxPriorityFeePerGas, so we need to set it to 0 for non-EIP1559 chains.
export const _getFeeData = async (provider: JsonRpcProvider, isEIP1559: boolean): Promise<FeeData> => {
  const feeData = await provider.getFeeData()

  // Adjust for non-EIP-1559 chains
  if (feeData && !isEIP1559) {
    feeData.maxFeePerGas = feeData.gasPrice || feeData.maxFeePerGas
    feeData.maxPriorityFeePerGas = BigNumber.from(0)
  }

  return feeData
}

const useGasPrice = (): {
  maxFeePerGas?: BigNumber
  maxPriorityFeePerGas?: BigNumber
  gasPriceError?: Error
  gasPriceLoading: boolean
} => {
  const chain = useCurrentChain()
  const gasPriceConfigs = chain?.gasPrice
  const [counter] = useIntervalCounter(REFRESH_DELAY)
  const provider = useWeb3ReadOnly()

  // Fetch gas price from oracles or get a fixed value
  const [gasPrice, gasPriceError, gasPriceLoading] = useAsync<BigNumber | undefined>(
    () => {
      if (gasPriceConfigs) {
        return getGasPrice(gasPriceConfigs)
      }
    },
    [gasPriceConfigs, counter],
    false,
  )

  // Fetch the gas fees from the blockchain itself
  const [feeData, feeDataError, feeDataLoading] = useAsync<FeeData>(
    () => {
      if (!chain || !provider) return
      return _getFeeData(provider, hasFeature(chain, FEATURES.EIP1559))
    },
    [chain, provider, counter],
    false,
  )

  // Prepare the return values
  const maxFee = gasPrice || feeData?.maxFeePerGas || undefined
  const maxPrioFee = feeData?.maxPriorityFeePerGas || undefined
  const error = gasPriceError || feeDataError
  const loading = gasPriceLoading || feeDataLoading

  return useMemo(
    () => ({
      maxFeePerGas: maxFee,
      maxPriorityFeePerGas: maxPrioFee,
      gasPriceError: error,
      gasPriceLoading: loading,
    }),
    [maxFee, maxPrioFee, error, loading],
  )
}

export default useGasPrice
