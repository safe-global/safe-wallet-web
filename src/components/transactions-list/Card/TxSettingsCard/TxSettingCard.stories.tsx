import type { Meta, StoryObj } from '@storybook/react'
import TxSettingsCard from '@/src/components/transactions-list/Card/TxSettingsCard'
import { mockTransferWithInfo } from '@/src/tests/mocks'
import { SettingsChange, TransactionInfoType } from '@safe-global/safe-gateway-typescript-sdk'

const meta: Meta<typeof TxSettingsCard> = {
  title: 'TransactionsList/TxSettingsCard',
  component: TxSettingsCard,
  argTypes: {},
  args: {
    txInfo: mockTransferWithInfo({
      type: TransactionInfoType.SETTINGS_CHANGE,
    }) as SettingsChange,
  },
}

export default meta

type Story = StoryObj<typeof TxSettingsCard>

export const Default: Story = {}
