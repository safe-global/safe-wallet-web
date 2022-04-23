import Web3 from 'web3'
import semverSatisfies from 'semver/functions/satisfies'
import { WalletState } from '@web3-onboard/core'
import Web3Adapter from '@gnosis.pm/safe-web3-lib'
import Safe from '@gnosis.pm/safe-core-sdk'
import type { provider } from 'web3-core'
import { RPC_AUTHENTICATION, type ChainInfo, type RpcUri } from '@gnosis.pm/safe-react-gateway-sdk'

import chains from '@/config/chains'
import { getConnectedWallet } from '@/services/useOnboard'
import { INFURA_TOKEN } from '@/config/constants'

const LEGACY_VERSION = '<1.3.0'

// Web3
let _web3ReadOnly: Web3

export const setWeb3ReadOnly = ({ rpcUri }: ChainInfo): void => {
  _web3ReadOnly = new Web3(
    new Web3.providers.HttpProvider(getRpcServiceUrl(rpcUri), {
      timeout: 10_000,
    }),
  )
}

export const getWeb3ReadOnly = (): Web3 => _web3ReadOnly

let _web3: Web3
let _web3Cache: { [walletLabel: string]: Web3 } = {}

export const setWeb3 = (wallets: WalletState[]): void => {
  _web3Cache = Object.values(wallets).reduce<typeof _web3Cache>((cache, { label, provider }) => {
    cache[label] = new Web3(provider as unknown as provider)
    return cache
  }, {})

  const { label } = getConnectedWallet(wallets)

  _web3 = _web3Cache[label]
}

export const getWeb3 = (): Web3 => _web3

const getWeb3Adapter = (signerAddress: string): Web3Adapter => {
  return new Web3Adapter({
    web3: getWeb3(),
    signerAddress,
  })
}

// Safe Core SDK
let safeSDK: Safe
export const getSafeSDK = (): Safe => safeSDK

export const setSafeSDK = async (
  signerAddress: string,
  chainId: string,
  safeAddress: string,
  safeVersion: string,
): Promise<void> => {
  const ethAdapter = getWeb3Adapter(signerAddress)

  let isL1SafeMasterCopy = chainId === chains.eth

  // Legacy Safe contracts
  if (semverSatisfies(safeVersion, LEGACY_VERSION)) {
    isL1SafeMasterCopy = true
  }

  safeSDK = await Safe.create({
    ethAdapter,
    safeAddress,
    isL1SafeMasterCopy,
  })
}

const formatRpcServiceUrl = ({ authentication, value }: RpcUri, TOKEN: string): string => {
  const needsToken = authentication === RPC_AUTHENTICATION.API_KEY_PATH
  return needsToken ? `${value}${TOKEN}` : value
}

export const getRpcServiceUrl = (rpcUri: RpcUri): string => {
  return formatRpcServiceUrl(rpcUri, INFURA_TOKEN)
}
