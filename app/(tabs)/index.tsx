import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import PendingTransactions from '@/src/components/StatusBanners/PendingTransactions'
import usePendingTxs from '@/src/hooks/usePendingTxs'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import { shortenAddress } from '@/src/utils/formatters'
import { router } from 'expo-router'
import { StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSelector } from 'react-redux'

import { Avatar, Text, View } from 'tamagui'

export default function HomeScreen() {
  const { amount, hasMore, isLoading } = usePendingTxs()
  const activeSafe = useSelector(selectActiveSafe)

  const onPendingTransactionsPress = () => {
    router.push('/pending-transactions')
  }

  return (
    <SafeAreaView style={styles.content}>
      <View flexDirection="row" alignItems="center" justifyContent="space-between" marginVertical="$6">
        <View flexDirection="row" alignItems="center" columnGap="$3">
          <Avatar circular size="$10">
            <Avatar.Image
              accessibilityLabel="Nate Wienert"
              src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?&w=100&h=100&dpr=2&q=80"
            />
            <Avatar.Fallback delayMs={600} backgroundColor="$blue10" />
          </Avatar>

          <View justifyContent="center" alignItems="center" flexDirection="row">
            <Text fontSize="$5" fontWeight={600}>
              {shortenAddress(activeSafe.address)}
            </Text>
            <SafeFontIcon name="arrow-down" />
          </View>
        </View>

        <TouchableOpacity>
          <SafeFontIcon name="apps" />
        </TouchableOpacity>
      </View>

      <PendingTransactions
        isLoading={isLoading}
        onPress={onPendingTransactionsPress}
        number={`${amount}${hasMore ? '+' : ''}`}
      />
    </SafeAreaView>
  )
}

export const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 10,
  },
})
