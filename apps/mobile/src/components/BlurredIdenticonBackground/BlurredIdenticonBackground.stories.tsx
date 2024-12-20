import type { Meta, StoryObj } from '@storybook/react'
import { BlurredIdenticonBackground } from '@/src/components/BlurredIdenticonBackground'
import { View } from 'tamagui'

const meta: Meta<typeof BlurredIdenticonBackground> = {
  title: 'BlurredIdenticonBackground',
  component: BlurredIdenticonBackground,
  argTypes: {},
}

export default meta

type Story = StoryObj<typeof BlurredIdenticonBackground>

export const Default: Story = {
  args: {
    address: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
  },
  decorators: [
    (Story) => (
      // This is a hack to make the story full screen
      // we apply global decorator padding of 16 in preview.tsx
      // and then we remove it here
      <View style={{ margin: -16, padding: 0 }}>
        <Story />
      </View>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
}
