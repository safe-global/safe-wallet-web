import React from 'react'
import { View } from 'tamagui'
import SafeListItem from '@/src/components/SafeListItem'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import { Cancellation, ExecutionInfo } from '@safe-global/safe-gateway-typescript-sdk'

interface TxRejectionCardProps {
  bordered?: boolean
  txInfo: Cancellation
  inQueue?: boolean
  executionInfo?: ExecutionInfo
}

function TxRejectionCard({ bordered, executionInfo, txInfo, inQueue }: TxRejectionCardProps) {
  return (
    <SafeListItem
      type="Rejected"
      executionInfo={executionInfo}
      label={txInfo.methodName || 'On-chain rejection'}
      inQueue={inQueue}
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
