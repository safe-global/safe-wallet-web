import { LATEST_SAFE_VERSION } from '@/config/constants'
import { defaultSafeInfo } from '@/store/safeInfoSlice'
import type { PredictedSafeProps } from '@safe-global/protocol-kit'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import {
  type ChainInfo,
  ImplementationVersionState,
  type SafeBalanceResponse,
  TokenType,
} from '@safe-global/safe-gateway-typescript-sdk'
import type { BrowserProvider } from 'ethers'

export const getUndeployedSafeInfo = (undeployedSafe: PredictedSafeProps, address: string, chainId: string) => {
  return Promise.resolve({
    ...defaultSafeInfo,
    address: { value: address },
    chainId,
    owners: undeployedSafe.safeAccountConfig.owners.map((owner) => ({ value: owner })),
    nonce: 0,
    threshold: undeployedSafe.safeAccountConfig.threshold,
    implementationVersionState: ImplementationVersionState.UP_TO_DATE,
    fallbackHandler: { value: undeployedSafe.safeAccountConfig.fallbackHandler! },
    version: LATEST_SAFE_VERSION,
    deployed: false,
  })
}

export const getCounterfactualBalance = async (safeAddress: string, provider?: BrowserProvider, chain?: ChainInfo) => {
  const balance = await provider?.getBalance(safeAddress)

  if (!balance || !chain) return

  return <SafeBalanceResponse>{
    fiatTotal: '0',
    items: [
      {
        tokenInfo: {
          type: TokenType.NATIVE_TOKEN,
          address: ZERO_ADDRESS,
          ...chain?.nativeCurrency,
        },
        balance: balance.toString(),
        fiatBalance: '0',
        fiatConversion: '0',
      },
    ],
  }
}
