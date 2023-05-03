import React, { useCallback, useState, useMemo } from 'react'
import { useAppSelector } from '@/store'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { AppRoutes } from '@/config/routes'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import { List } from '@mui/material'
import useChains from '@/hooks/useChains'
import { Notification } from './notification'
import { useRouter } from 'next/router'

const ChatNotifications = () => {
  const router = useRouter()
  const { configs } = useChains()
  const addedSafes: any = useAppSelector(selectAllAddedSafes)
  const isWelcomePage = router.pathname === AppRoutes.welcome
  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx
  const [addedSafeList, setAddedSafesList] = useState<any>()

  const getHref = useCallback(
    (chain: ChainInfo, address: string) => {
      return {
        pathname: isWelcomePage ? AppRoutes.home : isSingleTxPage ? AppRoutes.transactions.history : router.pathname,
        query: { ...router.query },
      }
    },
    [isWelcomePage, isSingleTxPage, router.pathname, router.query],
  )

  useMemo(() => {
    const data: any = []
    configs.map((chain) => {
      const addedSafesOnChain = addedSafes[chain.chainId] ?? {}
      const addedSafeEntriesOnChain = Object.entries(addedSafesOnChain)
      if (addedSafeEntriesOnChain.length) {
        data.push({ addedSafeEntriesOnChain, chain })
      }
    })
    console.log(data)
    setAddedSafesList(data)
  }, [configs])

  return (
    <List sx={{ display: 'flex' }}>
      {addedSafeList?.map((data: any, i: number) => {
        const href = getHref(data.chain, data.addedSafeEntriesOnChain[0])
        const info = {
          href,
          address: data.addedSafeEntriesOnChain[0][0],
          isVisible: true,
          chainId: data.chain.chainId,
          isAdded: true,
          name: data.addedSafeEntriesOnChain[0][0],
          threshold: data.addedSafeEntriesOnChain[0][1].threshold,
          owners: data.addedSafeEntriesOnChain[0][1].owners,
        }
        console.log(info, '1')
        return <Notification info={info} key={`address-${i}`} />
      })}
    </List>
  )
}

export default React.memo(ChatNotifications)
