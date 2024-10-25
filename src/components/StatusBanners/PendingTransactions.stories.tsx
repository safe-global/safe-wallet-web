import type { Meta, StoryObj } from '@storybook/react'
import { PendingTransactions } from '@/src/components/StatusBanners/PendingTransactions'

const meta: Meta<typeof PendingTransactions> = {
  title: 'StatusBanners/PendingTransactions',
  component: PendingTransactions,
  argTypes: {
    number: { control: 'number' },
  },
  args: {
    number: 5,
  },
}

export default meta

type Story = StoryObj<typeof PendingTransactions>

export const Default: Story = {}
