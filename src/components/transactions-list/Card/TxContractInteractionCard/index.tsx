import React from 'react'
import { Avatar, Text, Theme, View } from 'tamagui'
import SafeListItem from '@/src/components/SafeListItem'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import { Custom, ExecutionInfo, MultiSend } from '@safe-global/safe-gateway-typescript-sdk'

interface TxContractInteractionCardProps {
  bordered?: boolean
  txInfo: Custom | MultiSend
  inQueue?: boolean
  executionInfo?: ExecutionInfo
}

function TxContractInteractionCard({ bordered, executionInfo, txInfo, inQueue }: TxContractInteractionCardProps) {
  const logoUri = txInfo.to.logoUri
  const label = txInfo.to.name || 'Contract interaction'
  return (
    <SafeListItem
      label={label}
      icon={logoUri ? 'transaction-contract' : undefined}
      type={txInfo.methodName}
      bordered={bordered}
      executionInfo={executionInfo}
      inQueue={inQueue}
      leftNode={
        <Avatar circular size="$10">
          <Theme name="logo">
            {logoUri && <Avatar.Image backgroundColor="$background" accessibilityLabel={label} src={logoUri} />}

            <Avatar.Fallback backgroundColor="$background">
              <View backgroundColor="$background" padding="$2" borderRadius={100}>
                <SafeFontIcon name="code-blocks" color="$color" />
              </View>
            </Avatar.Fallback>
          </Theme>
        </Avatar>
      }
      rightNode={<Text>{txInfo.methodName}</Text>}
    />
  )
}

export default TxContractInteractionCard
