import type { Meta, StoryObj } from '@storybook/react'
import EnableAccountBanner from './index'
import { Paper } from '@mui/material'
import type { Eip1193Provider } from 'ethers'
import { BrowserProvider } from 'ethers'

const mockBrowserProvider = new BrowserProvider({
  request: () => {},
} as unknown as Eip1193Provider)

const meta = {
  component: EnableAccountBanner,
  parameters: {
    layout: 'centered',
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
} satisfies Meta<typeof EnableAccountBanner>

export default meta
type Story = StoryObj<typeof meta>

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    provider: mockBrowserProvider,
  },
}
