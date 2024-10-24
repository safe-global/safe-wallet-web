import { StyleSheet } from 'react-native'

import TxHistory from '@/src/features/TxHistory'

import { Text } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.content}>
      <Text testID="welcome-title" paddingHorizontal={20}>
        Transactions History
      </Text>

      <TxHistory />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    rowGap: 20,
  },
})
