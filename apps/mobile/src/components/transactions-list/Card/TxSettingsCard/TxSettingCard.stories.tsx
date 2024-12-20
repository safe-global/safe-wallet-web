import type { Meta, StoryObj } from '@storybook/react'
import { TxSettingsCard } from '@/src/components/transactions-list/Card/TxSettingsCard'
import { mockTransferWithInfo } from '@/src/tests/mocks'
import { SettingsChangeTransaction } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'
import { TransactionInfoType } from '@safe-global/store/gateway/types'

const meta: Meta<typeof TxSettingsCard> = {
  title: 'TransactionsList/TxSettingsCard',
  component: TxSettingsCard,
  argTypes: {},
  args: {
    txInfo: mockTransferWithInfo({
      type: TransactionInfoType.SETTINGS_CHANGE,
    }) as SettingsChangeTransaction,
  },
}

export default meta

type Story = StoryObj<typeof TxSettingsCard>

export const Default: Story = {}
