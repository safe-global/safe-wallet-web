import type { Meta, StoryObj } from '@storybook/react'
import { TxCreationCard } from '@/src/components/transactions-list/Card/TxCreationCard'
import { mockTransferWithInfo } from '@/src/tests/mocks'
import { type CreationTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { TransactionInfoType } from '@safe-global/store/gateway/types'

const meta: Meta<typeof TxCreationCard> = {
  title: 'TransactionsList/TxCreationCard',
  component: TxCreationCard,
  argTypes: {
    bordered: {
      description: 'Define if you want a border on the transaction',
      control: {
        type: 'boolean',
      },
    },
  },
  args: {
    bordered: false,
    txInfo: mockTransferWithInfo({
      type: TransactionInfoType.CREATION,
      creator: {
        name: 'Nevinha',
        logoUri: '',
        value: '0xas123da123sdasdsd001230sdf1sdf12sd12f',
      },
    }) as CreationTransactionInfo,
  },
}

export default meta

type Story = StoryObj<typeof TxCreationCard>

export const Default: Story = {}
