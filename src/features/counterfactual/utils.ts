import type { NewSafeFormData } from '@/components/new-safe/create'
import { CREATION_MODAL_QUERY_PARM } from '@/components/new-safe/create/logic'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { AppRoutes } from '@/config/routes'
import { addUndeployedSafe, type UndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import { getWeb3ReadOnly } from '@/hooks/wallets/web3'
import ExternalStore from '@/services/ExternalStore'
import type { AppDispatch } from '@/store'
import { addOrUpdateSafe } from '@/store/addedSafesSlice'
import { upsertAddressBookEntry } from '@/store/addressBookSlice'
import { defaultSafeInfo } from '@/store/safeInfoSlice'
import type { DeploySafeProps, PredictedSafeProps } from '@safe-global/protocol-kit'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import type { SafeVersion } from '@safe-global/safe-core-sdk-types'
import {
  type ChainInfo,
  ImplementationVersionState,
  type SafeBalanceResponse,
  TokenType,
} from '@safe-global/safe-gateway-typescript-sdk'
import type { BrowserProvider } from 'ethers'
import type { NextRouter } from 'next/router'

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

const { getStore: getNativeBalance, setStore: setNativeBalance } = new ExternalStore<bigint | undefined>()

export const getCounterfactualBalance = async (safeAddress: string, provider?: BrowserProvider, chain?: ChainInfo) => {
  let balance: bigint | undefined

  // Fetch balance via the connected wallet.
  // If there is no wallet connected we fetch and cache the balance instead
  if (provider) {
    balance = await provider.getBalance(safeAddress)
  } else {
    const cachedBalance = getNativeBalance()
    balance = cachedBalance !== undefined ? cachedBalance : await getWeb3ReadOnly()?.getBalance(safeAddress)
    setNativeBalance(balance)
  }

  if (balance === undefined || !chain) return

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

export const createCounterfactualSafe = (
  chain: ChainInfo,
  safeAddress: string,
  saltNonce: string,
  data: NewSafeFormData,
  dispatch: AppDispatch,
  props: DeploySafeProps,
  router: NextRouter,
) => {
  const undeployedSafe = {
    chainId: chain.chainId,
    address: safeAddress,
    safeProps: {
      safeAccountConfig: props.safeAccountConfig,
      safeDeploymentConfig: {
        saltNonce,
        safeVersion: LATEST_SAFE_VERSION as SafeVersion,
      },
    },
  }

  dispatch(addUndeployedSafe(undeployedSafe))
  dispatch(upsertAddressBookEntry({ chainId: chain.chainId, address: safeAddress, name: data.name }))
  dispatch(
    addOrUpdateSafe({
      safe: {
        ...defaultSafeInfo,
        address: { value: safeAddress, name: data.name },
        threshold: data.threshold,
        owners: data.owners.map((owner) => ({
          value: owner.address,
          name: owner.name || owner.ens,
        })),
        chainId: chain.chainId,
      },
    }),
  )
  router.push({
    pathname: AppRoutes.home,
    query: { safe: `${chain.shortName}:${safeAddress}`, [CREATION_MODAL_QUERY_PARM]: true },
  })
}

export const isUndeployedSafe = (value: any): value is UndeployedSafe => {
  return 'chainId' in value && 'safeAddress' in value && 'safeProps' in value
}
