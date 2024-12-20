import type { Meta, StoryObj } from '@storybook/react'
import { TxContractInteractionCard } from '@/src/components/transactions-list/Card/TxContractInteractionCard'
import { mockTransferWithInfo } from '@/src/tests/mocks'
import { CustomTransactionInfo } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { TransactionInfoType } from '@safe-global/store/gateway/types'

const meta: Meta<typeof TxContractInteractionCard> = {
  title: 'TransactionsList/TxContractInteractionCard',
  component: TxContractInteractionCard,
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
      to: {
        value: '0x0000',
        name: 'CryptoNevinhosos',
        logoUri: '',
      },
    }) as CustomTransactionInfo,
  },
}

export default meta

type Story = StoryObj<typeof TxContractInteractionCard>

export const Default: Story = {}
