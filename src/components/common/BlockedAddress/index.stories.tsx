import type { Meta, StoryObj } from '@storybook/react'
import BlockedAddress from './index'

const meta = {
  component: BlockedAddress,
  parameters: {
    componentSubtitle: 'Renders an information block intended for users whose address is blocked by OFAC',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof BlockedAddress>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    address: '0xD3a484faEa53313eF85b5916C9302a3E304ae622',
  },
  parameters: {
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/VyA38zUPbJ2zflzCIYR6Nu/Swap?node-id=6167%3A14371&mode=dev',
    },
  },
}
