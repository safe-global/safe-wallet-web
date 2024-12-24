import React from 'react'
import { Text, View } from 'tamagui'
import { SafeListItem } from '@/src/components/SafeListItem'
import { ellipsis } from '@/src/utils/formatters'
import { IdenticonWithBadge } from '@/src/features/Settings/components/IdenticonWithBadge'
import { Address } from '@/src/types/address'
import { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import { ChainsDisplay } from '@/src/components/ChainsDisplay'

interface AccountCardProps {
  name: string | Address
  balance: string
  address: Address
  owners: number
  threshold: number
  rightNode?: string | React.ReactNode
  chains: Chain[]
}

export function AccountCard({ name, chains, owners, balance, address, threshold, rightNode }: AccountCardProps) {
  return (
    <SafeListItem
      label={
        <View>
          <Text fontSize="$4" fontWeight={600}>
            {ellipsis(name, 18)}
          </Text>
          <Text fontSize="$4" color="$colorSecondary" fontWeight={400}>
            ${ellipsis(balance, 14)}
          </Text>
        </View>
      }
      leftNode={
        <View marginRight="$2">
          <IdenticonWithBadge
            testID="threshold-info-badge"
            size={40}
            address={address}
            badgeContent={`${threshold}/${owners}`}
          />
        </View>
      }
      rightNode={
        <View columnGap="$2" flexDirection="row">
          <ChainsDisplay chains={chains} max={3} />
          {rightNode}
        </View>
      }
      transparent
    />
  )
}
