import { AssetsCard } from '@/src/components/transactions-list/Card/AssetsCard'
import { Collectible } from '@/src/store/gateway/AUTO_GENERATED/collectibles'
import React from 'react'

function NFTItem({ item }: { item: Collectible }) {
  return (
    <AssetsCard
      name={item.name || `${item.tokenName} #${item.id}`}
      logoUri={item.logoUri}
      description={item.tokenName}
      rightNode={`#${item.id}`}
    />
  )
}

export default NFTItem
