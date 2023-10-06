import { ContractVersions, getModuleInstance, KnownContracts } from '@gnosis.pm/zodiac'
import type { Delay, SupportedNetworks } from '@gnosis.pm/zodiac'
import type { JsonRpcProvider } from '@ethersproject/providers'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { sameAddress } from '@/utils/addresses'
import { getGenericProxyMasterCopy, getGnosisProxyMasterCopy, isGenericProxy, isGnosisProxy } from './proxies'

export const MODULE_PAGE_SIZE = 100

async function isOfficialDelayModifier(
  chainId: string,
  moduleAddress: string,
  provider: JsonRpcProvider,
): Promise<boolean> {
  const bytecode = await provider.getCode(moduleAddress)

  if (isGenericProxy(bytecode)) {
    const masterCopy = getGenericProxyMasterCopy(bytecode)
    return await isOfficialDelayModifier(chainId, masterCopy, provider)
  }

  // TODO: Check if this is necessary
  if (isGnosisProxy(bytecode)) {
    const masterCopy = await getGnosisProxyMasterCopy(moduleAddress, provider)
    return await isOfficialDelayModifier(chainId, masterCopy, provider)
  }

  const zodiacChainContracts = ContractVersions[Number(chainId) as SupportedNetworks]
  const zodiacContract = Object.entries(zodiacChainContracts).find(([, addresses]) => {
    return Object.values(addresses).some((address) => {
      return sameAddress(address, moduleAddress)
    })
  })

  return zodiacContract?.[0] === KnownContracts.DELAY
}

export async function getDelayModifiers(
  chainId: string,
  modules: SafeInfo['modules'],
  provider: JsonRpcProvider,
): Promise<Array<Delay>> {
  if (!modules) {
    return []
  }

  const instances = await Promise.all(
    modules.map(async ({ value }) => {
      const isDelayModifier = await isOfficialDelayModifier(chainId, value, provider)

      if (!isDelayModifier) {
        return null
      }

      return getModuleInstance(KnownContracts.DELAY, value, provider)
    }),
  )

  return instances.filter(Boolean) as Array<Delay>
}
