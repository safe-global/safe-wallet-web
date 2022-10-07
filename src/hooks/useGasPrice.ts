import { BigNumber } from 'ethers'
import type { FeeData } from '@ethersproject/providers'
import type { GasPrice, GasPriceOracle } from '@gnosis.pm/safe-react-gateway-sdk'
import { GAS_PRICE_TYPE } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from './useChains'
import useIntervalCounter from './useIntervalCounter'
import { useRef } from 'react'
import { useWeb3ReadOnly } from '../hooks/wallets/web3'

const REFRESH_DELAY = 20e3 // 20 seconds

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
        console.error('Error fetching gas price from oracle', err)
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
  gasPriceError?: Error
  gasPriceLoading: boolean
} => {
  const chain = useCurrentChain()
  const gasPriceConfigs = chain?.gasPrice
  const [counter] = useIntervalCounter(REFRESH_DELAY)
  const provider = useWeb3ReadOnly()

  const [gasPrice, gasPriceError, gasPriceLoading] = useAsync<BigNumber | undefined>(() => {
    if (gasPriceConfigs) {
      return getGasPrice(gasPriceConfigs)
    }
  }, [gasPriceConfigs, counter])

  const [feeData, feeDataError, feeDataLoading] = useAsync<FeeData>(() => {
    return provider?.getFeeData()
  }, [provider, counter])

  // Save the previous gas price so that we don't return undefined each time it's polled
  const lastPrice = useRef<BigNumber>()
  // Fallback to feeData.gasPrice for non-EIP-1559 networks
  lastPrice.current = gasPrice || feeData?.maxFeePerGas || feeData?.gasPrice || lastPrice.current

  const lastPrioFee = useRef<BigNumber>()
  // Fallback to 0 for non-EIP-1559 networks
  lastPrioFee.current = feeData ? feeData.maxPriorityFeePerGas || BigNumber.from(0) : lastPrioFee.current

  return {
    maxFeePerGas: lastPrice.current,
    maxPriorityFeePerGas: lastPrioFee.current,
    gasPriceError: gasPriceError || feeDataError,
    gasPriceLoading: gasPriceLoading || feeDataLoading,
  }
}

export default useGasPrice
