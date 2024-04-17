import type { Meta, StoryObj } from '@storybook/react'
import { SellOrder as SellOrderComponent } from './index'
import { Paper } from '@mui/material'
import type { OrderKind, OrderStatuses, TransactionInfoType, SwapOrder } from '@safe-global/safe-gateway-typescript-sdk'

const FulfilledSwapOrder: SwapOrder = {
  type: 'SwapOrder' as TransactionInfoType.SWAP_ORDER,
  humanDescription: null,
  richDecodedInfo: null,
  orderUid:
    '0xdfbc181c3cea514808cf74363a1914a9988881db2d125b026c3e5feffb359f9e7a9af6ef9197041a5841e84cb27873bebd3486e26613f9d1',
  status: 'fulfilled' as OrderStatuses,
  orderKind: 'sell' as OrderKind,
  sellToken: {
    logo: 'https://safe-transaction-assets.staging.5afe.dev/tokens/logos/0x0625aFB445C3B6B7B929342a04A22599fd5dBB59.png',
    symbol: 'COW',
    amount: '5',
  },
  buyToken: {
    logo: 'https://safe-transaction-assets.staging.5afe.dev/tokens/logos/0xbe72E441BF55620febc26715db68d3494213D8Cb.png',
    symbol: 'USDC',
    amount: '34.240403272089864',
  },
  expiresTimestamp: new Date().getTime() / 1000 + 28 * 60,
  filledPercentage: '100.00',
  explorerUrl:
    'https://explorer.cow.fi/orders/0xdfbc181c3cea514808cf74363a1914a9988881db2d125b026c3e5feffb359f9e7a9af6ef9197041a5841e84cb27873bebd3486e26613f9d1',
  executionPriceLabel: '1 COW = 0.14508041726505666 USDC',
  surplusLabel: '0.22324174807285857 USDC',
}

const NonFulfilledSwapOrder = {
  ...FulfilledSwapOrder,
  status: 'open' as OrderStatuses,
  limitPriceLabel: FulfilledSwapOrder.executionPriceLabel,
  expiresTimestamp: new Date().getTime() / 1000 + 28 * 60,
}

if (NonFulfilledSwapOrder.executionPriceLabel) {
  delete NonFulfilledSwapOrder.executionPriceLabel
}

const meta = {
  component: SellOrderComponent,
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
  // excludeStories: ['SwapOrderProps'],
} satisfies Meta<typeof SellOrderComponent>

export default meta
type Story = StoryObj<typeof meta>

export const Executed: Story = {
  args: {
    order: FulfilledSwapOrder,
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/VyA38zUPbJ2zflzCIYR6Nu/Swap?type=design&node-id=5813-37759&mode=design&t=cJDGDQGZFqccSTaB-4',
    },
  },
}

export const Pending: Story = {
  args: {
    order: {
      ...NonFulfilledSwapOrder,
      status: 'presignaturePending' as OrderStatuses,
    },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/VyA38zUPbJ2zflzCIYR6Nu/Swap?type=design&node-id=5974-14391&mode=design&t=cJDGDQGZFqccSTaB-4',
    },
  },
}

export const Open: Story = {
  args: {
    order: {
      ...NonFulfilledSwapOrder,
    },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/VyA38zUPbJ2zflzCIYR6Nu/Swap?type=design&node-id=5813-37808&mode=design&t=cJDGDQGZFqccSTaB-4',
    },
  },
}

export const Cancelled: Story = {
  args: {
    order: {
      ...NonFulfilledSwapOrder,
      status: 'cancelled' as OrderStatuses,
      expiresTimestamp: new Date().getTime() / 1000 - 28 * 60,
    },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/VyA38zUPbJ2zflzCIYR6Nu/Swap?type=design&node-id=5813-37924&mode=design&t=cJDGDQGZFqccSTaB-4',
    },
  },
}

export const Expired: Story = {
  args: {
    order: {
      ...NonFulfilledSwapOrder,
      status: 'expired' as OrderStatuses,
      limitPriceLabel: FulfilledSwapOrder.executionPriceLabel,
      expiresTimestamp: new Date().getTime() / 1000 - 28 * 60,
    },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/VyA38zUPbJ2zflzCIYR6Nu/Swap?type=design&node-id=5813-37987&mode=design&t=cJDGDQGZFqccSTaB-4',
    },
  },
}
