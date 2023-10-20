import { faker } from '@faker-js/faker'
import { RPC_AUTHENTICATION, GAS_PRICE_TYPE } from '@safe-global/safe-gateway-typescript-sdk'
import type {
  BlockExplorerUriTemplate,
  ChainInfo,
  GasPriceFixed,
  GasPriceFixedEIP1559,
  GasPriceOracle,
  GasPriceUnknown,
  NativeCurrency,
  RpcUri,
  Theme,
} from '@safe-global/safe-gateway-typescript-sdk'

import { Builder } from '@/tests/Builder'
import { FEATURES } from '@/utils/chains'
import { generateRandomArray } from './utils'
import type { IBuilder } from '@/tests/Builder'
import type useChains from '@/hooks/useChains'

const rpcUriBuilder = (): IBuilder<RpcUri> => {
  return Builder.new<RpcUri>()
    .with('authentication', RPC_AUTHENTICATION.NO_AUTHENTICATION)
    .with('value', faker.internet.url({ appendSlash: false }))
}

const blockExplorerUriTemplateBuilder = (): IBuilder<BlockExplorerUriTemplate> => {
  return Builder.new<BlockExplorerUriTemplate>()
    .with('address', faker.finance.ethereumAddress())
    .with('txHash', faker.string.hexadecimal())
    .with('api', faker.internet.url({ appendSlash: false }))
}

const nativeCurrencyBuilder = (): IBuilder<NativeCurrency> => {
  return Builder.new<NativeCurrency>()
    .with('name', faker.finance.currencyName())
    .with('symbol', faker.finance.currencySymbol())
    .with('decimals', 18)
    .with('logoUri', faker.internet.url({ appendSlash: false }))
}

const themeBuilder = (): IBuilder<Theme> => {
  return Builder.new<Theme>().with('textColor', faker.color.rgb()).with('backgroundColor', faker.color.rgb())
}

const gasPriceFixedBuilder = (): IBuilder<GasPriceFixed> => {
  return Builder.new<GasPriceFixed>().with('type', GAS_PRICE_TYPE.FIXED).with('weiValue', faker.string.numeric())
}

const gasPriceFixedEIP1559Builder = (): IBuilder<GasPriceFixedEIP1559> => {
  return Builder.new<GasPriceFixedEIP1559>()
    .with('type', GAS_PRICE_TYPE.FIXED_1559)
    .with('maxFeePerGas', faker.string.numeric())
    .with('maxPriorityFeePerGas', faker.string.numeric())
}

const gasPriceOracleBuilder = (): IBuilder<GasPriceOracle> => {
  return Builder.new<GasPriceOracle>()
    .with('type', GAS_PRICE_TYPE.ORACLE)
    .with('uri', faker.internet.url({ appendSlash: false }))
    .with('gasParameter', faker.word.sample())
    .with('gweiFactor', faker.string.numeric())
}

const gasPriceOracleUnknownBuilder = (): IBuilder<GasPriceUnknown> => {
  return Builder.new<GasPriceUnknown>().with('type', GAS_PRICE_TYPE.UNKNOWN)
}

const getRandomGasPriceBuilder = () => {
  const gasPriceBuilders = [
    gasPriceFixedBuilder(),
    gasPriceFixedEIP1559Builder(),
    gasPriceOracleBuilder(),
    gasPriceOracleUnknownBuilder(),
  ]

  const randomIndex = Math.floor(Math.random() * gasPriceBuilders.length)
  return gasPriceBuilders[randomIndex]
}

export const chainBuilder = (): IBuilder<ChainInfo> => {
  return Builder.new<ChainInfo>()
    .with('chainId', faker.string.numeric())
    .with('chainName', faker.word.sample())
    .with('description', faker.word.words())
    .with('l2', faker.datatype.boolean())
    .with('shortName', faker.word.sample())
    .with('rpcUri', rpcUriBuilder().build())
    .with('safeAppsRpcUri', rpcUriBuilder().build())
    .with('publicRpcUri', rpcUriBuilder().build())
    .with('blockExplorerUriTemplate', blockExplorerUriTemplateBuilder().build())
    .with('nativeCurrency', nativeCurrencyBuilder().build())
    .with('transactionService', faker.internet.url({ appendSlash: true }))
    .with('theme', themeBuilder().build())
    .with(
      'gasPrice',
      generateRandomArray(() => getRandomGasPriceBuilder().build(), { min: 1, max: 4 }),
    )
    .with('ensRegistryAddress', faker.finance.ethereumAddress())
    .with(
      'disabledWallets',
      generateRandomArray(() => faker.word.sample(), { min: 1, max: 10 }),
    )
    .with(
      'features',
      // @ts-expect-error - we are using a local FEATURES enum
      generateRandomArray(() => faker.helpers.enumValue(FEATURES), { min: 1, max: 10 }),
    )
}

export const useChainsBuilder = (): IBuilder<ReturnType<typeof useChains>> => {
  return Builder.new<ReturnType<typeof useChains>>()
    .with(
      'configs',
      generateRandomArray(() => chainBuilder().build(), { min: 1, max: 25 }),
    )
    .with('loading', false)
}
