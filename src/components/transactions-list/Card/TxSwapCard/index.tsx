import React from 'react'
import { Avatar, Text, Theme, View } from 'tamagui'
import TxListItem from '@/src/components/SafeListItem'
import { Order } from '@safe-global/safe-gateway-typescript-sdk'
import { formatValue } from '@/src/utils/formatters'

interface TxSwapCardProps {
  txInfo: Order
  bordered?: boolean
}

function TxSwapCard({ txInfo, bordered }: TxSwapCardProps) {
  return (
    <TxListItem
      label={`${txInfo.sellToken.symbol} > ${txInfo.buyToken.symbol}`}
      icon="transaction-swap"
      type="Swap order"
      bordered={bordered}
      leftNode={
        <Theme name="logo">
          <View position="relative" width="$10" height="$10">
            <Avatar circular size="$7" position="absolute" top={0}>
              {txInfo.sellToken.logoUri && (
                <Avatar.Image
                  backgroundColor="$background"
                  accessibilityLabel={txInfo.sellToken.name}
                  src={txInfo.sellToken.logoUri}
                />
              )}
              <Avatar.Fallback backgroundColor="$background" />
            </Avatar>

            <Avatar circular size="$7" position="absolute" bottom={0} right={0} backgroundColor="$color">
              {txInfo.buyToken.logoUri && (
                <Avatar.Image
                  accessibilityLabel={txInfo.buyToken.name}
                  backgroundColor="$background"
                  src={txInfo.buyToken.logoUri}
                />
              )}
              <Avatar.Fallback backgroundColor="$background" />
            </Avatar>
          </View>
        </Theme>
      }
      rightNode={
        <View alignItems="flex-end">
          <Text color="$primary">
            +{formatValue(txInfo.buyAmount, txInfo.buyToken.decimals)} {txInfo.buyToken.symbol}
          </Text>
          <Text fontSize="$3">
            −{formatValue(txInfo.sellAmount, txInfo.sellToken.decimals)} {txInfo.sellToken.symbol}
          </Text>
        </View>
      }
    />
  )
}

export default TxSwapCard
