import type { Meta, StoryObj } from '@storybook/react'
import { TxRejectionCard } from '@/src/components/transactions-list/Card/TxRejectionCard'
import { mockTransferWithInfo } from '@/src/tests/mocks'
import { Cancellation } from '@safe-global/store/gateway/types'

const meta: Meta<typeof TxRejectionCard> = {
  title: 'TransactionsList/TxRejectionCard',
  component: TxRejectionCard,
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
    txInfo: mockTransferWithInfo({}) as Cancellation,
  },
}

export default meta

type Story = StoryObj<typeof TxRejectionCard>

export const Default: Story = {}
