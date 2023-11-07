import { faker } from '@faker-js/faker'
import type { AddressEx } from '@safe-global/safe-gateway-typescript-sdk'

import { Builder } from '../Builder'
import type { IBuilder } from '../Builder'

export const addressExBuilder = (): IBuilder<AddressEx> => {
  return Builder.new<AddressEx>().with({
    name: faker.word.words(),
    value: faker.finance.ethereumAddress(),
    logoUri: faker.image.url(),
  })
}
