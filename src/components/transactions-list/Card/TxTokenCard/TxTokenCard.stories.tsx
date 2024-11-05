import type { Meta, StoryObj } from '@storybook/react'
import TxTokenCard from '@/src/components/transactions-list/Card/TxTokenCard'
import { mockERC20Transfer, mockNFTTransfer } from '@/src/tests/mocks'
import { TransactionStatus, Transfer } from '@safe-global/safe-gateway-typescript-sdk'

const meta: Meta<typeof TxTokenCard> = {
  title: 'TransactionsList/TxTokenCard',
  component: TxTokenCard,
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
  },
}

export default meta
type Story = StoryObj<typeof TxTokenCard>

export const Default: Story = {
  args: {
    txStatus: TransactionStatus.SUCCESS,
    txInfo: mockERC20Transfer as Transfer,
  },
}
export const NFT: Story = {
  args: {
    txStatus: TransactionStatus.SUCCESS,
    txInfo: mockNFTTransfer as Transfer,
  },
}
