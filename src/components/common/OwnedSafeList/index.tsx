import React, { useCallback, useEffect, useState } from 'react'
import SafeListItem from '@/components/sidebar/SafeListItem'
import type { Safe } from '@/hooks/useSafes'
import { useLoadSafeList } from '@/hooks/useSafes'
import { useOwnedSafes } from '@/hooks/useSafes'
import { Box, IconButton, List, Typography } from '@mui/material'
import css from './styles.module.css'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import useChains from '@/hooks/useChains'

const PAGE_SIZE = 2

const OwnedSafeList = ({ closeDrawer, isWelcomePage }: { closeDrawer?: () => void; isWelcomePage: boolean }) => {
  const [allLoadedSafes, setAllLoadedSafes] = useState<Safe[]>([])
  const [safesToDisplay, setSafesToDisplay] = useState<number>(PAGE_SIZE)
  const router = useRouter()
  const { configs } = useChains()
  const [safes] = useOwnedSafes()

  const safesToLoad = safes.slice(allLoadedSafes.length, safesToDisplay)
  const newLoadedSafes = useLoadSafeList(safesToLoad)

  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx

  useEffect(() => {
    if (newLoadedSafes) setAllLoadedSafes((prev) => [...prev, ...newLoadedSafes])
  }, [newLoadedSafes])

  const onShowMore = useCallback(() => {
    if (safes && safes.length > 0) {
      setSafesToDisplay((prev) => prev + PAGE_SIZE)
    }
  }, [safes])

  const getHref = useCallback(
    (chainId: String, address: string) => {
      const chain = configs.find((chain) => chain.chainId === chainId)
      return {
        pathname: isWelcomePage ? AppRoutes.home : isSingleTxPage ? AppRoutes.transactions.history : router.pathname,
        query: { ...router.query, safe: `${chain?.shortName}:${address}` },
      }
    },
    [isWelcomePage, isSingleTxPage, router.pathname, router.query, configs],
  )

  return (
    <div className={classNames(css.container, { [css.sidebarContainer]: !isWelcomePage })}>
      <div className={css.header}>
        <Typography variant="h5" display="inline" fontWeight={700}>
          My accounts
        </Typography>
      </div>

      {!safes.length && (
        <Box display="flex" flexDirection="column" py={4} sx={{ maxWidth: '250px', margin: 'auto' }}>
          <Typography variant="body2" color="primary.light" textAlign="center" mt={2} mb={2}>
            No Safe Accounts yet
          </Typography>
        </Box>
      )}

      {!!safes.length && (
        <List className={css.list}>
          {allLoadedSafes.map(({ address, chainId }) => {
            const href = getHref(chainId, address)
            return (
              <SafeListItem
                key={chainId + address}
                address={address}
                chainId={chainId}
                // threshold={threshold}
                // owners={owners.length}
                // fiatBalance={fiatBalance}
                closeDrawer={closeDrawer}
                href={href}
                shouldScrollToSafe={false}
                isAdded
                isWelcomePage={isWelcomePage}
              />
            )
          })}
        </List>
      )}

      {safes.length > safesToDisplay && (
        <div className={css.ownedLabelWrapper} onClick={onShowMore}>
          <Typography variant="body2" display="inline" className={css.ownedLabel}>
            More Accounts
            <IconButton disableRipple>
              <ExpandMore />
            </IconButton>
          </Typography>
        </div>
      )}
    </div>
  )
}

export default OwnedSafeList
