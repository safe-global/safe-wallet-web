import type { Meta, StoryObj } from '@storybook/react'
import SwapTokenAmount from './index'
import { Paper } from '@mui/material'

const meta = {
  component: SwapTokenAmount,
  parameters: {
    componentSubtitle: 'Renders a stylized token amount with token symbol, logo and label',
  },

  decorators: [
    (Story) => {
      return (
        <Paper sx={{ padding: 2 }}>
          <Story />
        </Paper>
      )
    },
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof SwapTokenAmount>

export default meta
type Story = StoryObj<typeof meta>

export const WithLabel: Story = {
  args: {
    value: '100',
    label: 'Sell',
    logoUri:
      'https://safe-transaction-assets.staging.5afe.dev/tokens/logos/0x0625aFB445C3B6B7B929342a04A22599fd5dBB59.png',
    tokenSymbol: 'COW',
  },
}

export const WithoutLabel: Story = {
  args: {
    value: '100',
    logoUri:
      'https://safe-transaction-assets.staging.5afe.dev/tokens/logos/0x0625aFB445C3B6B7B929342a04A22599fd5dBB59.png',
    tokenSymbol: 'COW',
  },
}

export const WithoutLogo: Story = {
  args: {
    value: '100',
    label: 'Sell',
    tokenSymbol: 'COW',
  },
}

export const WithoutLogoAndLabel: Story = {
  args: {
    value: '100',
    tokenSymbol: 'COW',
  },
}
