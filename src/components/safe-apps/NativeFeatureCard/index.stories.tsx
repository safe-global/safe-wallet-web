import type { Meta, StoryObj } from '@storybook/react'
import NativeFeatureCard from './index'
import { Box } from '@mui/material'
import { SafeAppAccessPolicyTypes } from '@safe-global/safe-gateway-typescript-sdk'

const meta = {
  component: NativeFeatureCard,
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
} satisfies Meta<typeof NativeFeatureCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    details: {
      id: 100_000,
      url: '',
      name: 'Native swaps are here!',
      description: 'Experience seamless trading with better decoding and security in native swaps.',
      accessControl: { type: SafeAppAccessPolicyTypes.NoRestrictions },
      tags: ['DeFi'],
      features: [],
      socialProfiles: [],
      developerWebsite: '',
      chainIds: ['11155111'],
      iconUrl: '@/public/images/common/swap.svg',
    },
  },
}
