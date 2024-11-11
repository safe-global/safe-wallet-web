import React from 'react'
import { Avatar, Text, View } from 'tamagui'
import TxListItem from '@/src/components/SafeListItem'
import { ExecutionInfo, MultiSend, SafeAppInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'

interface TxSafeAppCardProps {
  safeAppInfo: SafeAppInfo
  txInfo: MultiSend
  bordered?: boolean
  inQueue?: boolean
  executionInfo?: ExecutionInfo
}

function TxSafeAppCard({ safeAppInfo, executionInfo, txInfo, inQueue, bordered }: TxSafeAppCardProps) {
  return (
    <TxListItem
      label={safeAppInfo.name}
      inQueue={inQueue}
      icon="transaction-contract"
      type="Safe app"
      bordered={bordered}
      executionInfo={executionInfo}
      leftNode={
        <Avatar circular size="$10">
          <Avatar.Image accessibilityLabel={safeAppInfo.name} src={safeAppInfo.logoUri} />
          <Avatar.Fallback backgroundColor="$borderLight">
            <View backgroundColor="$borderLightDark" padding="$2" borderRadius={100}>
              <SafeFontIcon name="code-blocks" color="$color" />
            </View>
          </Avatar.Fallback>
        </Avatar>
      }
      rightNode={<Text>{txInfo.methodName}</Text>}
    />
  )
}

export default TxSafeAppCard
