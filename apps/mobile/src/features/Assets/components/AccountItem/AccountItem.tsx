import React from 'react'
import { TouchableOpacity } from 'react-native'
import { View } from 'tamagui'
import { SafeFontIcon } from '@/src/components/SafeFontIcon'
import { AccountCard } from '@/src/components/transactions-list/Card/AccountCard'
import { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import { Address } from '@/src/types/address'
import { SafeOverview } from '@safe-global/store/gateway/AUTO_GENERATED/safes'
import { shortenAddress } from '@/src/utils/formatters'

interface AccountItemProps {
  chains: Chain[]
  account: SafeOverview
  activeAccount: Address
  onSelect: (accountAddress: string) => void
}

// TODO: These props needs to come from the AccountItem.container component
// remove this comment once it is done
export function AccountItem({ account, chains, activeAccount, onSelect }: AccountItemProps) {
  const isActive = activeAccount === account.address.value

  const handleChainSelect = () => {
    onSelect(account.address.value)
  }

  return (
    <TouchableOpacity style={{ width: '100%' }} onPress={handleChainSelect}>
      <View
        testID="account-item-wrapper"
        backgroundColor={isActive ? '$borderLight' : '$backgroundTransparent'}
        borderRadius="$4"
      >
        <AccountCard
          threshold={account.threshold}
          owners={account.owners.length}
          name={account.address.name || shortenAddress(account.address.value)}
          address={account.address.value as Address}
          balance={account.fiatTotal}
          chains={chains}
          rightNode={isActive && <SafeFontIcon name="check" color="$color" />}
        />
      </View>
    </TouchableOpacity>
  )
}

export default AccountItem
