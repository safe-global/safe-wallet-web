import React from 'react'
import { Avatar, View } from 'tamagui'
import TxListItem from '@/src/components/SafeListItem'
import { ExecutionInfo, MultiSend } from '@safe-global/safe-gateway-typescript-sdk'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'

interface TxBatchCardProps {
  txInfo: MultiSend
  bordered?: boolean
  label?: string
  inQueue?: boolean
  executionInfo?: ExecutionInfo
}

function TxBatchCard({ txInfo, bordered, executionInfo, inQueue, label }: TxBatchCardProps) {
  const logoUri = txInfo.to.logoUri

  return (
    <TxListItem
      label={label || `${txInfo.actionCount} actions`}
      icon="batch"
      inQueue={inQueue}
      executionInfo={executionInfo}
      type={'Batch'}
      bordered={bordered}
      leftNode={
        <Avatar circular size="$10">
          {logoUri && <Avatar.Image accessibilityLabel="Cam" src={logoUri} />}

          <Avatar.Fallback backgroundColor="$borderLight">
            <View backgroundColor="$borderLightDark" padding="$2" borderRadius={100}>
              <SafeFontIcon color="$primary" name="batch" />
            </View>
          </Avatar.Fallback>
        </Avatar>
      }
    />
  )
}

export default TxBatchCard
