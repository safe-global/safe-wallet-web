import React, { useCallback, useMemo, useState } from 'react'
import SafeListItem from '@/components/sidebar/SafeListItem'
import { useWatchedSafes } from '@/hooks/useSafes'
import { Box, Button, CircularProgress, IconButton, List, Typography } from '@mui/material'
import css from './styles.module.css'
import ExpandMore from '@mui/icons-material/ExpandMore'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { AppRoutes } from '@/config/routes'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import useConnectWallet from '../ConnectWallet/useConnectWallet'

const MAX_SAFES = 5

const OwnedSafeList = ({ closeDrawer, isWelcomePage }: { closeDrawer?: () => void; isWelcomePage: boolean }) => {
  const [lastChainId, setLastChainId] = useState<string | undefined>()
  const [isListExpanded, setIsListExpanded] = useState<boolean>(false)
  const router = useRouter()
  const connectWallet = useConnectWallet()

  // use watched safes list here for now. Change later to owned safes
  const [safes, error, isLoading] = useWatchedSafes()

  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx

  const safesToShow = useMemo(() => {
    return isListExpanded ? safes : safes.slice(0, MAX_SAFES)
  }, [safes, isListExpanded])

  const onShowMore = useCallback(() => {
    if (safes.length > 0) {
      setLastChainId(safes[safes.length - 1].chain.chainId)
      setIsListExpanded((prev) => !prev)
    }
  }, [safes])

  const getHref = useCallback(
    (chain: ChainInfo, address: string) => {
      return {
        pathname: isWelcomePage ? AppRoutes.home : isSingleTxPage ? AppRoutes.transactions.history : router.pathname,
        query: { ...router.query, safe: `${chain.shortName}:${address}` },
      }
    },
    [isWelcomePage, isSingleTxPage, router.pathname, router.query],
  )

  return (
    <div className={classNames(css.container, { [css.sidebarContainer]: !isWelcomePage })}>
      <div className={css.header}>
        <Typography variant="h5" display="inline" fontWeight={700}>
          My accounts
        </Typography>
      </div>

      {isLoading && (
        <Box py={4} textAlign="center">
          <CircularProgress size={20} />
        </Box>
      )}

      {!safes.length && (
        <Box display="flex" flexDirection="column" py={4} sx={{ maxWidth: '250px', margin: 'auto' }}>
          <Typography variant="body2" color="primary.light" textAlign="center" mt={2} mb={2}>
            No safe accounts yet
          </Typography>
        </Box>
      )}

      {!!safes.length && (
        <List className={css.list}>
          {safesToShow.map(({ safeAddress, chain, fiatBalance, threshold, owners }) => {
            const href = getHref(chain, safeAddress)
            return (
              <SafeListItem
                key={chain.chainId + safeAddress}
                address={safeAddress}
                chainId={chain.chainId}
                threshold={threshold}
                owners={owners.length}
                fiatBalance={fiatBalance}
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

      {!isListExpanded && safes.length > MAX_SAFES && (
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
