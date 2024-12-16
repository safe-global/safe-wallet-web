import type { Meta, StoryObj } from '@storybook/react'
import { TxSwapCard } from '@/src/components/transactions-list/Card/TxSwapCard'
import { mockSwapTransfer } from '@/src/tests/mocks'
import { OrderTransactionInfo } from '@safe-global/store/gateway/types'

const meta: Meta<typeof TxSwapCard> = {
  title: 'TransactionsList/TxSwapCard',
  component: TxSwapCard,
  args: {
    txInfo: mockSwapTransfer as OrderTransactionInfo,
  },
}

export default meta

type Story = StoryObj<typeof TxSwapCard>

export const Default: Story = {}
