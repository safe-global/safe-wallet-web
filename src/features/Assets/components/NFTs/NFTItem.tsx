import React from 'react'
import { AssetsCard } from '@/src/components/transactions-list/Card/AssetsCard'
import { Collectible } from '@/src/store/gateway/AUTO_GENERATED/collectibles'

export function NFTItem({ item }: { item: Collectible }) {
  return (
    <AssetsCard
      name={item.name || `${item.tokenName} #${item.id}`}
      logoUri={item.logoUri}
      description={item.tokenName}
      rightNode={`#${item.id}`}
    />
  )
}
