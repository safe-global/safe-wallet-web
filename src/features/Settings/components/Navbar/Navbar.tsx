import React from 'react'
import { View } from 'tamagui'
import { SettingsMenu } from '@/src/features/Settings/components/Navbar/SettingsMenu'
import { SettingsButton } from '@/src/features/Settings/components/Navbar/SettingsButton'

export const Navbar = (props: { safeAddress: string }) => {
  return (
    <View gap={10} flexDirection={'row'} marginRight={'$4'}>
      <SettingsButton />
      <SettingsMenu safeAddress={props.safeAddress} />
    </View>
  )
}
