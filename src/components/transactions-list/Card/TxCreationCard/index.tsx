import React from 'react'
import { Theme, View } from 'tamagui'
import TxListItem from '@/src/components/SafeListItem'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'
import { Creation } from '@safe-global/safe-gateway-typescript-sdk'
import { shortenAddress } from '@/src/utils/formatters'

interface TxCreationCardProps {
  txInfo: Creation
  bordered?: boolean
}

function TxCreationCard({ txInfo, bordered }: TxCreationCardProps) {
  return (
    <TxListItem
      bordered={bordered}
      label={`Created by: ${shortenAddress(txInfo.creator.value)}`}
      type="Safe Account created"
      leftNode={
        <Theme name="logo">
          <View backgroundColor="$background" padding="$2" borderRadius={100}>
            <SafeFontIcon name="plus" />
          </View>
        </Theme>
      }
    />
  )
}

export default TxCreationCard
