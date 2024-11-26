import React from 'react'
import SafeTab from '@/src/components/SafeTab'
import Tokens from './components/Tokens'
import AssetsHeader from './components/AssetsHeader'
import NFTs from './components/NFTs'

const tabItems = [
  {
    label: 'Tokens',
    Component: Tokens,
  },
  {
    label: `NFT's`,
    Component: NFTs,
  },
]

function Assets() {
  return <SafeTab items={tabItems} headerHeight={200} renderHeader={AssetsHeader} />
}

export default Assets
