import type { Meta, StoryObj } from '@storybook/react'
import { TxBatchCard } from '@/src/components/transactions-list/Card/TxBatchCard'
import { mockTransferWithInfo } from '@/src/tests/mocks'
import { MultiSend, TransactionInfoType } from '@safe-global/store/gateway/types'

const meta: Meta<typeof TxBatchCard> = {
  title: 'TransactionsList/TxBatchCard',
  component: TxBatchCard,
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
      type: TransactionInfoType.CUSTOM,
      actionCount: 2,
      to: {
        value: '',
        logoUri: 'https://safe-transaction-assets.safe.global/safe_apps/408a90a2-170c-485a-93bb-daa843298f11/icon.png',
        name: 'Gnosis Bridge',
      },
    }) as MultiSend,
  },
}

export default meta

type Story = StoryObj<typeof TxBatchCard>

export const Default: Story = {}
