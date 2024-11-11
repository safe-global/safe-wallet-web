import React from 'react'
import { Theme, View } from 'tamagui'
import TxListItem from '@/src/components/SafeListItem'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import { ExecutionInfo, SettingsChange, SettingsInfoType } from '@safe-global/safe-gateway-typescript-sdk'

interface TxSettingsCardProps {
  txInfo: SettingsChange
  bordered?: boolean
  inQueue?: boolean
  executionInfo?: ExecutionInfo
}

function TxSettingsCard({ txInfo, bordered, executionInfo, inQueue }: TxSettingsCardProps) {
  const isDeleteGuard = txInfo.settingsInfo?.type === SettingsInfoType.DELETE_GUARD
  const label = isDeleteGuard ? 'deleteGuard' : txInfo.dataDecoded.method

  return (
    <TxListItem
      label={label}
      inQueue={inQueue}
      executionInfo={executionInfo}
      bordered={bordered}
      type="Settings change"
      leftNode={
        <Theme name="logo">
          <View backgroundColor="$background" padding="$2" borderRadius={100}>
            <SafeFontIcon name="transaction-change-settings" />
          </View>
        </Theme>
      }
    />
  )
}

export default TxSettingsCard
