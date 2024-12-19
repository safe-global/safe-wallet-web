import { faker } from '@faker-js/faker'
import type { EIP712TypedData } from '@safe-global/safe-gateway-typescript-sdk'
import { Builder, type IBuilder } from '../Builder'

export function eip712TypedDataBuilder(): IBuilder<EIP712TypedData> {
  return Builder.new<EIP712TypedData>().with({
    domain: {
      chainId: faker.number.int({ min: 1, max: 10000 }),
      name: faker.string.alpha(),
      verifyingContract: faker.finance.ethereumAddress(),
    },
    types: {
      Test: [
        {
          name: 'example',
          type: 'uint8',
        },
      ],
    },
    message: {
      example: '8',
    },
  })
}
