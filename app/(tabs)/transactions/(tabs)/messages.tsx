import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import SafeListItem from '@/src/components/SafeListItem'
import { formatWithSchema } from '@/src/utils/date'
import React from 'react'
import { ScrollView, Text, View } from 'tamagui'
import { SafeAreaView } from 'react-native-safe-area-context'

function Messages() {
  return (
    <SafeAreaView style={{ flex: 1, flexDirection: 'column' }}>
      <ScrollView>
        <View paddingHorizontal="$3">
          <SafeListItem.Header title={formatWithSchema(Date.now(), 'MMM d, yyyy')} />
          <SafeListItem
            label={'Hello Web3Modal Eth'}
            leftNode={
              <View backgroundColor="$borderLightDark" padding="$2" borderRadius={100}>
                <SafeFontIcon name="sign" color="$primaryLight" />
              </View>
            }
            rightNode={
              <View backgroundColor="#1D3D28" paddingHorizontal={'$3'} paddingVertical={'$1'} borderRadius={25}>
                <Text color={'$primary'}>Success</Text>
              </View>
            }
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default Messages
