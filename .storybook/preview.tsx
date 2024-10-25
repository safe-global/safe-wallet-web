import type { Preview } from '@storybook/react'
import SafeThemeProvider from '@/src/providers/SafeThemeProvider/index'
import { View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => {
      return (
        <NavigationContainer independent={true}>
          <SafeThemeProvider>
            <View style={{ padding: 16, flex: 1 }}>
              <Story />
            </View>
          </SafeThemeProvider>
        </NavigationContainer>
      )
    },
  ],
}

export default preview
