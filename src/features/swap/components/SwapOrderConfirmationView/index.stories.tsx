import type { Meta, StoryObj } from '@storybook/react'
import SwapOrderConfirmationView from './index'
import { Paper } from '@mui/material'
import type { OrderStatuses } from '@safe-global/safe-gateway-typescript-sdk'
import { orderTokenBuilder, swapOrderConfirmationViewBuilder } from '@/features/swap/helpers/swapOrderBuilder'

const Order = swapOrderConfirmationViewBuilder()
  .with({ kind: 'sell' })
  .with({ sellAmount: '10000000' })
  .with({ executedSellAmount: '10000000' })
  .with({ sellToken: { ...orderTokenBuilder().build(), decimals: 6 } })
  .with({ validUntil: new Date().getTime() / 1000 + 28 * 60 })
  .with({ status: 'open' as OrderStatuses })
  .build()

const meta = {
  component: SwapOrderConfirmationView,

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
} satisfies Meta<typeof SwapOrderConfirmationView>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    order: Order,
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/VyA38zUPbJ2zflzCIYR6Nu/Swap?type=design&node-id=5256-18562&mode=design&t=FlMhDhzNxpNKWuc1-4',
    },
  },
}
