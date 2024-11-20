import { NavBarTitle } from '@/src/components/Title/NavBarTitle'
import { SafeAddressInput } from '@/src/features/Settings'
import { ScrollView, View } from 'tamagui'

export default function SettingsScreen() {
  return (
    <ScrollView>
      <View>
        <NavBarTitle>Settings</NavBarTitle>

        <SafeAddressInput />
      </View>
    </ScrollView>
  )
}
