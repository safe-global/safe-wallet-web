import { Tabs } from 'expo-router'
import React from 'react'
import { StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Title from '@/src/components/Title'
import InlineTab from '@/src/components/InlineTab'
import { View } from 'tamagui'

const TransactiosHeader = () => (
  <View paddingHorizontal="$3">
    <Title paddingTop={'$10'} marginBottom="$8" testID="welcome-title">
      Transactions
    </Title>

    <InlineTab
      items={[
        {
          path: '/transactions',
          label: 'History',
        },
        {
          path: '/transactions/messages',
          label: 'Messages',
        },
      ]}
    />
  </View>
)

export default function TransactionsLayout() {
  return (
    <SafeAreaView style={styles.content}>
      <TransactiosHeader />

      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: { display: 'none' },
        }}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="messages" />
      </Tabs>
    </SafeAreaView>
  )
}

export const styles = StyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column',
    width: '100%',
    rowGap: 10,
  },
})
