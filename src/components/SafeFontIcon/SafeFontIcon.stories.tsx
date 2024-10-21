import { View, Text, ScrollView } from 'react-native'
import type { Meta, StoryObj } from '@storybook/react'
import { SafeFontIcon } from './SafeFontIcon'
import { iconNames } from '@/src/types/iconTypes'

// Meta information for the Story
const meta: Meta<typeof SafeFontIcon> = {
  // title: 'Icons/AllIcons',
  component: SafeFontIcon,
  argTypes: {
    color: { control: 'color' },
  },
}

export default meta

// Create a type alias for the Story
type Story = StoryObj<typeof SafeFontIcon>

// Define the Story for displaying all icons
export const AllIcons: Story = {
  render: (args) => (
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
  ),
  args: {
    size: 50,
    color: 'black',
  },
}
