import React from 'react'
import { View } from 'tamagui'
import SafeListItem from '@/src/components/SafeListItem'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import { Cancellation } from '@safe-global/safe-gateway-typescript-sdk'

interface TxRejectionCardProps {
  bordered?: boolean
  txInfo: Cancellation
}

function TxRejectionCard({ bordered, txInfo }: TxRejectionCardProps) {
  return (
    <SafeListItem
      type="Rejected"
      label={txInfo.methodName || 'On-chain rejection'}
      bordered={bordered}
      leftNode={
        <View borderRadius={100} padding="$2" backgroundColor="$errorDark">
          <SafeFontIcon color="$error" name="close-outlined" />
        </View>
      }
    />
  )
}

export default TxRejectionCard
