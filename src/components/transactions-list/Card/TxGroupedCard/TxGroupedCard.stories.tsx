import type { Meta, StoryObj } from '@storybook/react'
import { mockERC20Transfer, mockListItemByType, mockNFTTransfer } from '@/src/tests/mocks'
import { Transaction, TransactionListItemType, TransactionStatus } from '@safe-global/safe-gateway-typescript-sdk'
import TxGroupedCard from '.'

const meta: Meta<typeof TxGroupedCard> = {
  title: 'TransactionsList/TxGroupedCard',
  component: TxGroupedCard,
  argTypes: {},
  args: {
    transactions: [
      {
        ...mockListItemByType(TransactionListItemType.TRANSACTION),
        transaction: {
          id: 'id',
          timestamp: 123123,
          txStatus: TransactionStatus.SUCCESS,
          txInfo: mockERC20Transfer,
          txHash: '0x0000000',
        },
      } as Transaction,
      {
        ...mockListItemByType(TransactionListItemType.TRANSACTION),
        transaction: {
          id: 'id',
          timestamp: 123123,
          txStatus: TransactionStatus.SUCCESS,
          txInfo: mockNFTTransfer,
          txHash: '0x0000000',
        },
      } as Transaction,
    ],
  },
}

export default meta

type Story = StoryObj<typeof TxGroupedCard>

export const Default: Story = {}
