import CircularBadge from '@/src/components/CircularBadge'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import Title from '@/src/components/Title'
import PendingTx from '@/src/features/PendingTx'
import usePendingTxs from '@/src/hooks/usePendingTxs'
import { router } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Button, Spinner, View } from 'tamagui'

function PendingScreen() {
  const { amount, isLoading, hasMore } = usePendingTxs()

  return (
    <SafeAreaView style={styles.container}>
      <View justifyContent="flex-start">
        <Button
          height={32}
          alignSelf="flex-start"
          width={32}
          onPress={router.back}
          borderRadius={100}
          icon={<SafeFontIcon name="arrow-down-1" />}
          style={{ rotate: '90deg' }}
        />

        <View marginVertical="$4" alignItems="center" flexDirection="row" gap="$3" alignSelf="center">
          <Title>Pending Transactions</Title>
          {isLoading ? (
            <Spinner size="large" color="$warning1ContrastTextDark" />
          ) : (
            <CircularBadge content={`${amount}${hasMore ? '+' : ''}`} />
          )}
        </View>
      </View>

      <PendingTx />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 7,
    flex: 1,
  },
})

export default PendingScreen
