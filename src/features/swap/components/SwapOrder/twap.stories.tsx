import type { Meta, StoryObj } from '@storybook/react'
import { TwapOrder as TwapOrderComponent } from './index'
import { Paper } from '@mui/material'
import { appDataBuilder, orderTokenBuilder, twapOrderBuilder } from '@/features/swap/helpers/swapOrderBuilder'
import { StoreDecorator } from '@/stories/storeDecorator'
import type { TransactionData } from '@safe-global/safe-gateway-typescript-sdk'

const FullfilledTwapOrder = twapOrderBuilder()
  .with({ status: 'fulfilled' })
  .with({ kind: 'sell' })
  .with({ orderClass: 'limit' })
  .with({ sellAmount: '10000000000000000' })
  .with({ executedSellAmount: '10000000000000000' })
  .with({ buyAmount: '3388586928324482608' })
  .with({ executedBuyAmount: '3388586928324482608' })
  .with({ validUntil: 1713520008 })
  .with({
    sellToken: {
      ...orderTokenBuilder().build(),
      logoUri:
        'https://safe-transaction-assets.staging.5afe.dev/tokens/logos/0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14.png',
    },
  })
  .with({
    buyToken: {
      ...orderTokenBuilder().build(),
      logoUri:
        'https://safe-transaction-assets.staging.5afe.dev/tokens/logos/0xbe72E441BF55620febc26715db68d3494213D8Cb.png',
    },
  })
  .with({ numberOfParts: '2' })

  .with({ partSellAmount: '5000000000000000' })
  .with({ minPartLimit: '1694293464162241304' })
  .with({ timeBetweenParts: 1800 })
  .with({
    fullAppData: appDataBuilder('twap').build(),
  })

const meta = {
  component: TwapOrderComponent,
  parameters: {
    componentSubtitle: 'Renders a Status label with icon and text for a swap order',
  },

  decorators: [
    (Story) => {
      return (
        <StoreDecorator initialState={{}}>
          <Paper sx={{ padding: 2 }}>
            <Story />
          </Paper>
        </StoreDecorator>
      )
    },
  ],
  tags: ['autodocs'],
  // excludeStories: ['SwapOrderProps'],
} satisfies Meta<typeof TwapOrderComponent>

export default meta
type Story = StoryObj<typeof meta>

export const ExecutedTwap: Story = {
  args: {
    order: FullfilledTwapOrder.build(),
    txData: {
      hexData:
        '0x0d0d9800000000000000000000000000000000000000000000000000000000000000008000000000000000000000000052ed56da04309aca4c3fecc595298d80c2f16bac000000000000000000000000000000000000000000000000000000000000024000000000000000000000000000000000000000000000000000000000000000010000000000000000000000006cf1e9ca41f7611def408122793c358a3d11e5a5000000000000000000000000000000000000000000000000000000190e49d9c200000000000000000000000000000000000000000000000000000000000000600000000000000000000000000000000000000000000000000000000000000140000000000000000000000000fff9976782d46cc05630d1f6ebab18b2324d6b14000000000000000000000000be72e441bf55620febc26715db68d3494213d8cb00000000000000000000000031eac7f0141837b266de30f4dc9af15629bd53810000000000000000000000000000000000000000000000000530055ba42172030000000000000000000000000000000000000000000000076a339a32b3e8cd2b000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000384000000000000000000000000000000000000000000000000000000000000000096d6f58d27a38d2d2956bec8afc6b11cf64210836f6908a8226af01f824f090b0000000000000000000000000000000000000000000000000000000000000000',
      to: {
        value: '0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74',
        name: 'ComposableCoW',
      },
      value: '0',
    } as unknown as TransactionData,
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/design/VyA38zUPbJ2zflzCIYR6Nu/Swap?node-id=6655-24390&t=pg5ZPJArWFJOiEsn-4',
    },
  },
}
