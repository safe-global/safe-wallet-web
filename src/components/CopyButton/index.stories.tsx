import type { StoryObj, Meta } from '@storybook/react'
import { CopyButton } from '@/src/components/CopyButton/index'

const meta: Meta<typeof CopyButton> = {
  title: 'CopyButton',
  component: CopyButton,
  args: {},
}

export default meta

type Story = StoryObj<typeof CopyButton>

/**
 * Displays a copy button. On press, the value passed is copied to the clipboard.
 */
export const Default: Story = {
  args: {
    value: '0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
  },
}
