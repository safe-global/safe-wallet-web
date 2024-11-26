import { safelyDecodeURIComponent } from 'expo-router/build/fork/getStateFromPath-forks'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

import SafeTab from '@/src/components/SafeTab'
import { POLLING_INTERVAL } from '@/src/config/constants'
import { selectActiveSafe } from '@/src/store/activeSafeSlice'
import {
  Collectible,
  CollectiblePage,
  useCollectiblesGetCollectiblesV2Query,
} from '@/src/store/gateway/AUTO_GENERATED/collectibles'

import Fallback from '../Fallback'
import NFTItem from './NFTItem'

function NFTs() {
  const activeSafe = useSelector(selectActiveSafe)
  const [pageUrl, setPageUrl] = useState<string>()
  const [list, setList] = useState<CollectiblePage['results']>()

  const { data, isLoading, error, refetch } = useCollectiblesGetCollectiblesV2Query(
    {
      chainId: activeSafe.chainId,
      safeAddress: activeSafe.address,
      cursor: pageUrl && safelyDecodeURIComponent(pageUrl?.split('cursor=')[1]),
    },
    {
      pollingInterval: POLLING_INTERVAL,
    },
  )

  useEffect(() => {
    if (!data?.results) return

    setList((prev) => (prev ? [...prev, ...data.results] : data.results))
  }, [data])

  const onEndReached = () => {
    if (!data?.next) return

    setPageUrl(data.next)
    refetch()
  }

  if (isLoading || !list?.length || error) return <Fallback loading={isLoading} hasError={!!error} />

  return (
    <SafeTab.FlatList<Collectible>
      onEndReached={onEndReached}
      data={list}
      renderItem={NFTItem}
      keyExtractor={(item) => item.id}
    />
  )
}

export default NFTs
