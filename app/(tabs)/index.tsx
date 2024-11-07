import { Alert } from '@/src/components/Alert'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function HomeScreen() {
  return (
    <SafeAreaView>
      <Alert type="warning" message="Conflicting Transactions" />
    </SafeAreaView>
  )
}
