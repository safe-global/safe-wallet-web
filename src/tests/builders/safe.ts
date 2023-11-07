import { faker } from '@faker-js/faker'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { generateRandomArray } from './utils'
import { addressExBuilder } from './address-ex'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { Builder } from '../Builder'
import type { IBuilder } from '../Builder'
import type useSafeInfo from '@/hooks/useSafeInfo'

const OWNERS_LENGTH = 5

export const safeInfo = (): IBuilder<SafeInfo> => {
  return Builder.new<SafeInfo>().with({
    address: addressExBuilder().build(),
    chainId: faker.string.numeric({ exclude: '0' }),
    nonce: faker.number.int(),
    threshold: faker.number.int(),
    owners: generateRandomArray(addressExBuilder().build, { min: 1, max: OWNERS_LENGTH }),
    implementation: addressExBuilder().build(),
    implementationVersionState: faker.helpers.enumValue(ImplementationVersionState),
    modules: faker.helpers.arrayElement([generateRandomArray(addressExBuilder().build), null]),
    guard: faker.helpers.arrayElement([addressExBuilder().build(), null]),
    fallbackHandler: addressExBuilder().build(),
    version: faker.helpers.arrayElement(['1.0.0', '1.1.1', '1.2.0', '1.3.0', LATEST_SAFE_VERSION]),
    collectiblesTag: faker.string.numeric(),
    txQueuedTag: faker.string.numeric(),
    txHistoryTag: faker.string.numeric(),
    messagesTag: faker.string.numeric(),
  })
}

export const useSafeInfoBuilder = (): IBuilder<ReturnType<typeof useSafeInfo>> => {
  const safe = safeInfo().build()

  return Builder.new<ReturnType<typeof useSafeInfo>>().with({
    safe,
    safeAddress: safe.address.value,
    safeLoaded: true,
    safeError: undefined,
    safeLoading: false,
  })
}
