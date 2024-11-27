import React from 'react'
import { View } from 'tamagui'
import { SafeListItem } from '@/src/components/SafeListItem'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import type { Cancellation } from '@/src/store/gateway/types'
import type { Transaction } from '@/src/store/gateway/AUTO_GENERATED/transactions'

interface TxRejectionCardProps {
  bordered?: boolean
  txInfo: Cancellation
  inQueue?: boolean
  executionInfo?: Transaction['executionInfo']
}

export function TxRejectionCard({ bordered, executionInfo, txInfo, inQueue }: TxRejectionCardProps) {
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
