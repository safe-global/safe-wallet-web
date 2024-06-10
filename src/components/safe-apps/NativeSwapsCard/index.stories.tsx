import type { Meta, StoryObj } from '@storybook/react'
import NativeSwapsCard from './index'
import { Box } from '@mui/material'

const meta = {
  component: NativeSwapsCard,
  parameters: {
    componentSubtitle: 'Renders an order id with an external link and a copy button',
  },

  decorators: [
    (Story) => {
      return (
        <Box sx={{ maxWidth: '500px' }}>
          <Story />
        </Box>
      )
    },
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof NativeSwapsCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { onDismiss: () => {} },
}
