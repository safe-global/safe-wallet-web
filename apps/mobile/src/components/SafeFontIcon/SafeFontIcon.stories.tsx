import { View, Text, ScrollView } from 'tamagui'
import type { Meta, StoryObj } from '@storybook/react'
import { SafeFontIcon } from './SafeFontIcon'
import { iconNames } from '@/src/types/iconTypes'

const meta: Meta<typeof SafeFontIcon> = {
  component: SafeFontIcon,
  argTypes: {
    color: { control: 'color' },
  },
}

export default meta

type Story = StoryObj<typeof SafeFontIcon>

export const AllIcons: Story = {
  render: (args) => {
    return (
      <ScrollView contentContainerStyle={{ padding: 10 }}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          {iconNames.map((iconName) => (
            <View key={iconName} style={{ width: '30%', alignItems: 'center', marginBottom: 20 }}>
              <SafeFontIcon {...args} name={iconName} />
              <Text style={{ marginTop: 10, fontWeight: 'bold' }}>{iconName}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    )
  },
  args: {
    size: 50,
  },
}
