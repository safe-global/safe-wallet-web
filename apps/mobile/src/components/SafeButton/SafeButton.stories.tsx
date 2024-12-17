import type { Meta, StoryObj } from '@storybook/react'
import { SafeButton } from '@/src/components/SafeButton'
import { action } from '@storybook/addon-actions'

const meta: Meta<typeof SafeButton> = {
  title: 'SafeButton',
  component: SafeButton,
  args: {
    label: 'Get started',
    onPress: action('onPress'),
  },
}

export default meta

type Story = StoryObj<typeof SafeButton>

export const Default: Story = {}
