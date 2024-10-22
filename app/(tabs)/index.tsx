import { StyleSheet } from 'react-native'

import { Text } from 'react-native-paper'
import TxHistory from '@/src/features/TxHistory'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.content}>
      <Text variant="titleLarge" testID="welcome-title">
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
    paddingLeft: 20,
  },
})
