import { faker } from '@faker-js/faker'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeInfo, AddressEx } from '@safe-global/safe-gateway-typescript-sdk'

import { Builder } from '../Builder'
import { generateRandomArray } from './utils'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import { checksumAddress } from '@/utils/addresses'
import type { IBuilder } from '../Builder'

const MAX_OWNERS_LENGTH = 10

export function addressExBuilder(): IBuilder<AddressEx> {
  return Builder.new<AddressEx>().with({
    value: checksumAddress(faker.finance.ethereumAddress()),
    name: faker.word.words(),
    logoUri: faker.image.url(),
  })
}

export function safeInfoBuilder(): IBuilder<SafeInfo> {
  return Builder.new<SafeInfo>().with({
    address: addressExBuilder().build(),
    chainId: faker.string.numeric(),
    nonce: faker.number.int(),
    threshold: faker.number.int(),
    owners: generateRandomArray(() => addressExBuilder().build(), { min: 1, max: MAX_OWNERS_LENGTH }),
    implementation: undefined,
    implementationVersionState: ImplementationVersionState.UP_TO_DATE,
    modules: [],
    guard: null,
    fallbackHandler: addressExBuilder().build(),
    version: LATEST_SAFE_VERSION,
    collectiblesTag: faker.string.numeric(),
    txQueuedTag: faker.string.numeric(),
    txHistoryTag: faker.string.numeric(),
    messagesTag: faker.string.numeric(),
  })
}
