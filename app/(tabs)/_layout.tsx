import { Tabs } from 'expo-router'
import React from 'react'
import { TabBarIcon } from '@/src/components/navigation/TabBarIcon'
import { LayoutHeader } from '.'
import { Navbar } from '@/src/features/Settings/components/Navbar/Navbar'

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          header: LayoutHeader,
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name={'wallet'} color={color} />,
        }}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Transactions',
          headerShown: false,
          tabBarButtonTestID: 'transactions',
          tabBarIcon: ({ color }) => <TabBarIcon name={'transactions'} color={color} />,
        }}
      />

      <Tabs.Screen
        name="settings"
        options={({ route }) => {
          // @ts-ignore
          const safeAddress = route.params?.safeAddress
          return {
            title: 'Settings',
            headerShown: true,
            headerShadowVisible: false,
            tabBarIcon: ({ color }) => <TabBarIcon name={'settings'} color={color} />,
            headerRight: () => {
              return <Navbar safeAddress={safeAddress} />
            },
          }
        }}
      />
    </Tabs>
  )
}
