import { useMemo } from 'react'
import { BigNumber } from 'ethers'
import type { FeeData } from '@ethersproject/providers'
import type { GasPrice, GasPriceOracle } from '@safe-global/safe-gateway-typescript-sdk'
import { GAS_PRICE_TYPE } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from './useChains'
import useIntervalCounter from './useIntervalCounter'
import { useWeb3ReadOnly } from '../hooks/wallets/web3'
import { Errors, logError } from '@/services/exceptions'
import { FEATURES, hasFeature } from '@/utils/chains'

// Update gas fees every 20 seconds
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

const useGasPrice = (): {
  maxFeePerGas?: BigNumber
  maxPriorityFeePerGas?: BigNumber
} => {
  const chain = useCurrentChain()
  const gasPriceConfigs = chain?.gasPrice
  const [counter] = useIntervalCounter(REFRESH_DELAY)
  const provider = useWeb3ReadOnly()
  const isEIP1559 = !!chain && hasFeature(chain, FEATURES.EIP1559)

  // Fetch gas price from oracles or get a fixed value
  const [gasPrice] = useAsync<BigNumber | undefined>(
    () => {
      if (gasPriceConfigs) {
        return getGasPrice(gasPriceConfigs)
      }
    },
    [gasPriceConfigs, counter],
    false,
  )

  // Fetch the gas fees from the blockchain itself
  const [feeData] = useAsync<FeeData>(() => provider?.getFeeData(), [provider, counter], false)

  // Prepare the return values
  const maxFee = gasPrice || (isEIP1559 ? feeData?.maxFeePerGas : feeData?.gasPrice) || undefined
  const maxPrioFee = (isEIP1559 && feeData?.maxPriorityFeePerGas) || undefined

  return useMemo(
    () => ({
      maxFeePerGas: maxFee,
      maxPriorityFeePerGas: maxPrioFee,
    }),
    [maxFee, maxPrioFee],
  )
}

export default useGasPrice
