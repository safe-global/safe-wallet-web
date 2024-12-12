import type { Meta, StoryObj } from '@storybook/react'
import { Paper } from '@mui/material'
import { StoreDecorator } from '@/stories/storeDecorator'
import ChangeThreshold from './index'
import { ChangeThresholdReviewContext } from '@/components/tx-flow/flows/ChangeThreshold/context'

const meta = {
  component: ChangeThreshold,
  parameters: {
    layout: 'centered',
    newThreshold: 1,
  },
  decorators: [
    (Story, { parameters }) => {
      return (
        <StoreDecorator initialState={{}}>
          <ChangeThresholdReviewContext.Provider value={{ newThreshold: parameters.newThreshold }}>
            <Paper sx={{ padding: 2 }}>
              <Story />
            </Paper>
          </ChangeThresholdReviewContext.Provider>
        </StoreDecorator>
      )
    },
  ],

  tags: ['autodocs'],
} satisfies Meta<typeof ChangeThreshold>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {},
}
