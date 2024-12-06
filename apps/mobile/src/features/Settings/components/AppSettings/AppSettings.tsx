import { View, Text, Input } from 'tamagui'
import { TouchableOpacity } from 'react-native'

interface AppSettingsProps {
  address: string
  onSubmit: () => void
  onAddressChange: (address: string) => void
}

export const AppSettings = ({ address, onAddressChange, onSubmit }: AppSettingsProps) => {
  return (
    <View paddingHorizontal={'$3'}>
      <View padding="$3">
        <Input
          value={address}
          onChangeText={onAddressChange}
          placeholder="Enter Safe Address"
          placeholderTextColor="#666"
          fontSize={20}
          height={30}
          marginVertical={10}
        />
        <TouchableOpacity onPress={onSubmit}>
          <Text>Set Safe Address</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}
