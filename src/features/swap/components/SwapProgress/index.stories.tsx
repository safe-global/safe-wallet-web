import type { Meta, StoryObj } from '@storybook/react'
import SwapProgress from './index'
import { Paper } from '@mui/material'

const meta = {
  component: SwapProgress,
  parameters: {
    componentSubtitle: 'Renders a linear progress bar with % of a token sold',
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
} satisfies Meta<typeof SwapProgress>

export default meta
type Story = StoryObj<typeof meta>

export const PartiallyFilled: Story = {
  args: {
    progress: '40.00',
    tokenAmount: '1',
    tokenSymbol: 'ETH',
  },
}

export const Filled: Story = {
  args: {
    progress: '100.00',
    tokenAmount: '1',
    tokenSymbol: 'ETH',
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/VyA38zUPbJ2zflzCIYR6Nu/Swap?node-id=5974%3A14487&mode=dev',
    },
  },
}
