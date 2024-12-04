import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from '@/src/components/Badge'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import React from 'react'
import { Text, View } from 'tamagui'

const meta: Meta<typeof Badge> = {
  title: 'Badge',
  component: Badge,
  args: {
    content: '3/9',
  },
}

export default meta

type Story = StoryObj<typeof Badge>

export const Circular: Story = {
  args: {
    content: '12+',
  },
}
export const CircularWithIcon: Story = {
  render: function Render(args) {
    return <Badge {...args} content={<SafeFontIcon size={13} name="owners" />} />
  },
}
export const NonCircular: Story = {
  args: {
    content: 'Badge',
    circular: false,
  },
}

export const NonCircularBold: Story = {
  args: {
    content: 'Badge',
    circular: false,
    textContentProps: {
      fontWeight: 700,
    },
  },
}

export const NonCircularWithComplexContent: Story = {
  args: {
    circular: false,
  },
  render: function Render(args) {
    return (
      <Badge
        {...args}
        content={
          <View alignItems="center" flexDirection="row" gap="$1">
            <SafeFontIcon size={13} name="owners" />

            <Text fontWeight={600} color={'$color'}>
              3/9
            </Text>
          </View>
        }
      />
    )
  },
}
