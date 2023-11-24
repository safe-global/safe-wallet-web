import { BigNumber } from 'ethers'
import type { FeeData } from '@ethersproject/abstract-provider'
import type {
  GasPrice,
  GasPriceFixed,
  GasPriceFixedEIP1559,
  GasPriceOracle,
} from '@safe-global/safe-gateway-typescript-sdk'
import { GAS_PRICE_TYPE } from '@safe-global/safe-gateway-typescript-sdk'
import useAsync, { type AsyncResult } from '@/hooks/useAsync'
import { useCurrentChain } from './useChains'
import useIntervalCounter from './useIntervalCounter'
import { useWeb3ReadOnly } from '../hooks/wallets/web3'
import { Errors, logError } from '@/services/exceptions'
import { FEATURES, hasFeature } from '@/utils/chains'
import { asError } from '@/services/exceptions/utils'

type EstimatedGasPrice =
  | {
      gasPrice: BigNumber
    }
  | {
      maxFeePerGas: BigNumber
      maxPriorityFeePerGas: BigNumber
    }

type GasFeeParams = {
  maxFeePerGas: BigNumber | null | undefined
  maxPriorityFeePerGas: BigNumber | null | undefined
}

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

// These typeguards are necessary because the GAS_PRICE_TYPE enum uses uppercase while the config service uses lowercase values
const isGasPriceFixed = (gasPriceConfig: GasPrice[number]): gasPriceConfig is GasPriceFixed => {
  return gasPriceConfig.type.toUpperCase() == GAS_PRICE_TYPE.FIXED
}

const isGasPriceFixed1559 = (gasPriceConfig: GasPrice[number]): gasPriceConfig is GasPriceFixedEIP1559 => {
  return gasPriceConfig.type.toUpperCase() == GAS_PRICE_TYPE.FIXED_1559
}

const isGasPriceOracle = (gasPriceConfig: GasPrice[number]): gasPriceConfig is GasPriceOracle => {
  return gasPriceConfig.type.toUpperCase() == GAS_PRICE_TYPE.ORACLE
}

const getGasPrice = async (gasPriceConfigs: GasPrice): Promise<EstimatedGasPrice | undefined> => {
  let error: Error | undefined
  for (const config of gasPriceConfigs) {
    if (isGasPriceFixed(config)) {
      return {
        gasPrice: BigNumber.from(config.weiValue),
      }
    }

    if (isGasPriceFixed1559(config)) {
      return {
        maxFeePerGas: BigNumber.from(config.maxFeePerGas),
        maxPriorityFeePerGas: BigNumber.from(config.maxPriorityFeePerGas),
      }
    }

    if (isGasPriceOracle(config)) {
      try {
        return {
          gasPrice: await fetchGasOracle(config),
        }
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

const getGasParameters = (
  estimation: EstimatedGasPrice | undefined,
  feeData: FeeData | undefined,
  isEIP1559: boolean,
): GasFeeParams => {
  if (!estimation) {
    return {
      maxFeePerGas: isEIP1559 ? feeData?.maxFeePerGas : feeData?.gasPrice,
      maxPriorityFeePerGas: isEIP1559 ? feeData?.maxPriorityFeePerGas : undefined,
    }
  }

  if (isEIP1559 && 'maxFeePerGas' in estimation && 'maxPriorityFeePerGas' in estimation) {
    return estimation
  }

  if ('gasPrice' in estimation) {
    return {
      maxFeePerGas: estimation.gasPrice,
      maxPriorityFeePerGas: isEIP1559 ? feeData?.maxPriorityFeePerGas : undefined,
    }
  }

  return {
    maxFeePerGas: undefined,
    maxPriorityFeePerGas: undefined,
  }
}
const useGasPrice = (): AsyncResult<GasFeeParams> => {
  const chain = useCurrentChain()
  const gasPriceConfigs = chain?.gasPrice
  const [counter] = useIntervalCounter(REFRESH_DELAY)
  const provider = useWeb3ReadOnly()
  const isEIP1559 = !!chain && hasFeature(chain, FEATURES.EIP1559)

  const [gasPrice, gasPriceError, gasPriceLoading] = useAsync(
    async () => {
      const [gasEstimation, feeData] = await Promise.all([
        // Fetch gas price from oracles or get a fixed value
        gasPriceConfigs ? getGasPrice(gasPriceConfigs) : undefined,

        // Fetch the gas fees from the blockchain itself
        provider?.getFeeData(),
      ])

      // Prepare the return values
      return getGasParameters(gasEstimation, feeData, isEIP1559)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gasPriceConfigs, provider, counter, isEIP1559],
    false,
  )

  const isLoading = gasPriceLoading || (!gasPrice && !gasPriceError)

  return [gasPrice, gasPriceError, isLoading]
}

export default useGasPrice
