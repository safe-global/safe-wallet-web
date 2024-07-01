import { Builder, type IBuilder } from '@/tests/Builder'
import { faker } from '@faker-js/faker'
import { SafeMessageListItemType, SafeMessageStatus, type SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'

export function safeMsgBuilder(): IBuilder<SafeMessage> {
  return Builder.new<SafeMessage>().with({
    type: SafeMessageListItemType.MESSAGE,
    messageHash: faker.string.hexadecimal(),
    status: SafeMessageStatus.NEEDS_CONFIRMATION,
    logoUri: null,
    name: null,
    message: 'Message text',
    creationTimestamp: faker.date.past().getTime(),
    modifiedTimestamp: faker.date.past().getTime(),
    confirmationsSubmitted: 1,
    confirmationsRequired: 2,
    proposedBy: { value: faker.finance.ethereumAddress() },
    confirmations: [
      {
        owner: { value: faker.finance.ethereumAddress() },
        signature: '',
      },
    ],
  })
}
