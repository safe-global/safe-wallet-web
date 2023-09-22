import { ContractVersions, getModuleInstance, KnownContracts } from '@gnosis.pm/zodiac'
import type { Delay } from '@gnosis.pm/zodiac'
import type { Web3Provider } from '@ethersproject/providers'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { sameAddress } from '@/utils/addresses'
import { getGenericProxyMasterCopy, getGnosisProxyMasterCopy, isGenericProxy, isGnosisProxy } from './proxies'

export const MODULE_PAGE_SIZE = 100

async function isOfficialDelayModifier(
  chainId: number,
  moduleAddress: string,
  provider: Web3Provider,
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

  const entry = Object.entries(ContractVersions[chainId as keyof typeof ContractVersions]).find(([, addresses]) => {
    return Object.values(addresses).some((address) => {
      return sameAddress(address, moduleAddress)
    })
  })

  return entry?.[0] === KnownContracts.DELAY
}

export async function getDelayModifiers(safe: SafeInfo, provider: Web3Provider): Promise<Array<Delay>> {
  if (!safe.modules) {
    return []
  }

  const instances = await Promise.all(
    safe.modules.map(async ({ value }) => {
      const isDelayModifier = await isOfficialDelayModifier(Number(safe.chainId), value, provider)

      if (!isDelayModifier) {
        return null
      }

      return getModuleInstance(KnownContracts.DELAY, value, provider)
    }),
  )

  return instances.filter(Boolean) as Array<Delay>
}
