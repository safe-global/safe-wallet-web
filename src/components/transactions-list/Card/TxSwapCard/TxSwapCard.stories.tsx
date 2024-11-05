import type { Meta, StoryObj } from '@storybook/react'
import TxSwapCard from '@/src/components/transactions-list/Card/TxSwapCard'
import { mockSwapTransfer } from '@/src/tests/mocks'
import { Order } from '@safe-global/safe-gateway-typescript-sdk'

const meta: Meta<typeof TxSwapCard> = {
  title: 'TransactionsList/TxSwapCard',
  component: TxSwapCard,
  args: {
    txInfo: mockSwapTransfer as Order,
  },
}

export default meta

type Story = StoryObj<typeof TxSwapCard>

export const Default: Story = {}
