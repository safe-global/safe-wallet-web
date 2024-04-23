import type { Meta, StoryObj } from '@storybook/react'
import { SellOrder as SellOrderComponent } from './index'
import { Paper } from '@mui/material'
import type { OrderStatuses, TransactionInfoType, SwapOrder } from '@safe-global/safe-gateway-typescript-sdk'

const FulfilledSwapOrder: SwapOrder = {
  type: 'SwapOrder' as TransactionInfoType.SWAP_ORDER,
  uid: '0x03a5d561ad2452d719a0d075573f4bed68217c696b52f151122c30e3e4426f1b05e6b5eb1d0e6aabab082057d5bb91f2ee6d11be66223d88',
  status: 'fulfilled',
  kind: 'sell',
  orderClass: 'limit',
  validUntil: 1713520008,
  sellAmount: '10000000000000000',
  buyAmount: '3388586928324482608',
  executedSellAmount: '10000000000000000',
  executedBuyAmount: '3391712661908938761',
  sellToken: {
    address: '0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14',
    decimals: 18,
    logoUri:
      'https://safe-transaction-assets.staging.5afe.dev/tokens/logos/0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14.png',
    name: 'Wrapped Ether',
    symbol: 'WETH',
    trusted: false,
  },
  buyToken: {
    address: '0xbe72E441BF55620febc26715db68d3494213D8Cb',
    decimals: 18,
    logoUri:
      'https://safe-transaction-assets.staging.5afe.dev/tokens/logos/0xbe72E441BF55620febc26715db68d3494213D8Cb.png',
    name: 'USDC (test)',
    symbol: 'USDC',
    trusted: false,
  },
  explorerUrl:
    'https://explorer.cow.fi/orders/0x03a5d561ad2452d719a0d075573f4bed68217c696b52f151122c30e3e4426f1b05e6b5eb1d0e6aabab082057d5bb91f2ee6d11be66223d88',
  executedSurplusFee: '276529971173727',
}

const NonFulfilledSwapOrder = {
  ...FulfilledSwapOrder,
  status: 'open' as OrderStatuses,
  expiresTimestamp: new Date().getTime() / 1000 + 28 * 60,
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
      validUntil: new Date().getTime() / 1000 + 28 * 60,
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
      validUntil: new Date().getTime() / 1000 - 28 * 60,
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
      validUntil: new Date().getTime() / 1000 - 28 * 60,
    },
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/VyA38zUPbJ2zflzCIYR6Nu/Swap?type=design&node-id=5813-37987&mode=design&t=cJDGDQGZFqccSTaB-4',
    },
  },
}
