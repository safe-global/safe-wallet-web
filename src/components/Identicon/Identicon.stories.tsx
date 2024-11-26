import type { Meta, StoryObj } from '@storybook/react'
import { Identicon } from '@/src/components/Identicon'
import { type Address } from '@/src/types/address'

const defaultProps = {
  address: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6' as Address,
  size: 56,
}
const meta: Meta<typeof Identicon> = {
  title: 'Identicon',
  component: Identicon,
  args: defaultProps,
}

export default meta

type Story = StoryObj<typeof Identicon>

export const Default: Story = {}

export const Rounded: Story = {
  args: {
    ...defaultProps,
    rounded: true,
  },
}
