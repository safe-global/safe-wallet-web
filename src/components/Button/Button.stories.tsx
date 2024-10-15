import React from 'react'
import { View } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react'
import { SafeButton } from './Button'

const meta = {
  title: 'SafeButton',
  component: SafeButton,
  argTypes: {
    onPress: { action: 'pressed the button' },
  },
  args: {
    text: 'Hello world',
  },
  decorators: [
    (Story) => (
      <View style={{ padding: 16, alignItems: 'flex-start' }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SafeButton>

export default meta

type Story = StoryObj<typeof meta>

export const Basic: Story = {}

export const AnotherExample: Story = {
  args: {
    text: 'Another example',
  },
}
