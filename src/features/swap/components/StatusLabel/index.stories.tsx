import type { Meta, StoryObj } from '@storybook/react'
import StatusLabel from './index'
import { Paper } from '@mui/material'

const meta = {
  component: StatusLabel,
  parameters: {
    componentSubtitle: 'Renders a Status label with icon and text for a swap order',
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
} satisfies Meta<typeof StatusLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Filled: Story = {
  args: {
    status: 'filled',
  },
}

export const Open: Story = {
  args: {
    status: 'open',
  },
}

export const Cancelled: Story = {
  args: {
    status: 'cancelled',
  },
}

export const Expired: Story = {
  args: {
    status: 'expired',
  },
}
