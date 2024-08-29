import { computeNewSafeAddress } from '@/components/new-safe/create/logic/index'
import { isSmartContract } from '@/utils/wallets'
import type { DeploySafeProps } from '@safe-global/protocol-kit'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { type SafeVersion } from '@safe-global/safe-core-sdk-types'
import { sameAddress } from '@/utils/addresses'
import { createWeb3ReadOnly, getRpcServiceUrl } from '@/hooks/wallets/web3'

export const getAvailableSaltNonce = async (
  customRpcs: {
    [chainId: string]: string
  },
  props: DeploySafeProps,
  chains: ChainInfo[],
  // All addresses from the sidebar disregarding the chain. This is an optimization to reduce RPC calls
  knownSafeAddresses: string[],
  safeVersion?: SafeVersion,
): Promise<string> => {
  let isAvailableOnAllChains = true
  const allRPCs = await Promise.all(
    chains.map((chain) => {
      const rpcUrl = customRpcs?.[chain.chainId] || getRpcServiceUrl(chain.rpcUri)
      // Turn into Eip1993Provider
      return {
        rpcUrl,
        chainId: chain.chainId,
      }
    }),
  )

  for (const chain of chains) {
    const rpcUrl = allRPCs.find((rpc) => chain.chainId === rpc.chainId)?.rpcUrl
    if (!rpcUrl) {
      throw new Error(`No RPC available for  ${chain.chainName}`)
    }
    const safeAddress = await computeNewSafeAddress(rpcUrl, props, chain, safeVersion)
    const isKnown = knownSafeAddresses.some((knownAddress) => sameAddress(knownAddress, safeAddress))
    if (isKnown || (await isSmartContract(safeAddress, createWeb3ReadOnly(chain, rpcUrl)))) {
      // We found a chain where the nonce is used up
      isAvailableOnAllChains = false
      break
    }
  }

  // Safe is already deployed so we try the next saltNonce
  if (!isAvailableOnAllChains) {
    return getAvailableSaltNonce(
      customRpcs,
      { ...props, saltNonce: (Number(props.saltNonce) + 1).toString() },
      chains,
      knownSafeAddresses,
      safeVersion,
    )
  }

  // We know that there will be a saltNonce but the type has it as optional
  return props.saltNonce!
}
