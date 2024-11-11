import type { Preview } from '@storybook/react'
import { NavigationIndependentTree } from '@react-navigation/native'
import { SafeThemeProvider } from '@/src/theme/provider/safeTheme'
import { View } from 'react-native'

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
        <NavigationIndependentTree>
          <SafeThemeProvider>
            <View style={{ padding: 16, flex: 1 }}>
              <Story />
            </View>
          </SafeThemeProvider>
        </NavigationIndependentTree>
      )
    },
  ],
}

export default preview
