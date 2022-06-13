import { GasPrice, GasPriceOracle, GAS_PRICE_TYPE } from '@gnosis.pm/safe-react-gateway-sdk'
import useAsync from '@/services/useAsync'
import { useCurrentChain } from './useChains'
import useIntervalCounter from './useIntervalCounter'
import { useRef } from 'react'

const REFRESH_DELAY = 20e3 // 20 seconds

const fetchGasOracle = async (gasPriceOracle: GasPriceOracle): Promise<string> => {
  const { uri, gasParameter, gweiFactor } = gasPriceOracle
  const json = await fetch(uri).then((resp) => resp.json())
  const data = json.data || json.result || json
  return (Number(data[gasParameter]) * Number(gweiFactor)).toString()
}

const getGasPrice = async (gasPriceConfigs: GasPrice): Promise<string> => {
  for (const config of gasPriceConfigs) {
    if (config.type == GAS_PRICE_TYPE.ORACLE) {
      try {
        return await fetchGasOracle(config)
      } catch (error) {
        console.error('Error fetching gas price from oracle', error)
        continue
      }
    } else if (config.type == GAS_PRICE_TYPE.FIXED) {
      return config.weiValue
    } else {
      continue
    }
  }
  return ''
}

const useGasPrice = (): {
  gasPrice?: string
  gasPriceError?: Error
  gasPriceLoading: boolean
} => {
  const chain = useCurrentChain()
  const gasPriceConfigs = chain?.gasPrice
  const [counter] = useIntervalCounter(REFRESH_DELAY)

  const [gasPrice, gasPriceError, gasPriceLoading] = useAsync<any>(async () => {
    if (!gasPriceConfigs) return
    return getGasPrice(gasPriceConfigs)
  }, [gasPriceConfigs, counter])

  const lastPrice = useRef<string>('')
  if (gasPrice) lastPrice.current = gasPrice

  return {
    gasPrice: lastPrice.current,
    gasPriceError,
    gasPriceLoading,
  }
}

export default useGasPrice
