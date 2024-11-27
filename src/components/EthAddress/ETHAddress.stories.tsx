import type { StoryObj, Meta } from '@storybook/react'
import { EthAddress } from '@/src/components/EthAddress'

const meta: Meta<typeof EthAddress> = {
  title: 'EthAddress',
  component: EthAddress,
  args: {},
}

export default meta

type Story = StoryObj<typeof EthAddress>

export const Default: Story = {
  args: {
    address: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
  },
}

export const WithCopy: Story = {
  args: {
    address: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
    copy: true,
  },
}
