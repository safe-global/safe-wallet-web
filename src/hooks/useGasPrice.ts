import { BigNumber } from 'ethers'
import type { GasPrice, GasPriceOracle } from '@safe-global/safe-gateway-typescript-sdk'
import { GAS_PRICE_TYPE } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from '@/hooks/useAsync'
import { useCurrentChain } from './useChains'
import useIntervalCounter from './useIntervalCounter'
import { useWeb3ReadOnly } from '../hooks/wallets/web3'
import { Errors, logError } from '@/services/exceptions'
import { FEATURES, hasFeature } from '@/utils/chains'
import { asError } from '@/services/exceptions/utils'

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
      } catch (_err) {
        error = asError(_err)
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

const useGasPrice = (): AsyncResult<{
  maxFeePerGas: BigNumber | undefined
  maxPriorityFeePerGas: BigNumber | undefined
}> => {
  const chain = useCurrentChain()
  const gasPriceConfigs = chain?.gasPrice
  const [counter] = useIntervalCounter(REFRESH_DELAY)
  const provider = useWeb3ReadOnly()
  const isEIP1559 = !!chain && hasFeature(chain, FEATURES.EIP1559)

  const [gasPrice, gasPriceError, gasPriceLoading] = useAsync(
    async () => {
      const [gasPrice, feeData] = await Promise.all([
        // Fetch gas price from oracles or get a fixed value
        gasPriceConfigs ? getGasPrice(gasPriceConfigs) : undefined,

        // Fetch the gas fees from the blockchain itself
        provider?.getFeeData(),
      ])

      // Prepare the return values
      const maxFee = gasPrice || (isEIP1559 ? feeData?.maxFeePerGas : feeData?.gasPrice) || undefined
      const maxPrioFee = (isEIP1559 && feeData?.maxPriorityFeePerGas) || undefined

      return {
        maxFeePerGas: maxFee,
        maxPriorityFeePerGas: maxPrioFee,
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gasPriceConfigs, provider, counter, isEIP1559],
    false,
  )

  const isLoading = gasPriceLoading || (!gasPrice && !gasPriceError)

  return [gasPrice, gasPriceError, isLoading]
}

export default useGasPrice
