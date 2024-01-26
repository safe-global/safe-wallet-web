import React, { Fragment, useState, type ReactElement, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import Button from '@mui/material/Button'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import Box from '@mui/material/Box'
import { Link as MuiLink } from '@mui/material'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import AddIcon from '@/public/images/common/add.svg'

import useChains, { useCurrentChain } from '@/hooks/useChains'
import { useAllWatchedSafes } from '@/hooks/useOwnedSafes'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import type { AddedSafesOnChain } from '@/store/addedSafesSlice'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import SafeListItem from '@/components/sidebar/SafeListItem'

import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import { sameAddress } from '@/utils/addresses'
import useSafeInfo from '@/hooks/useSafeInfo'
import LoadingIcon from '@/public/images/common/loading.svg'
import useWallet from '@/hooks/wallets/useWallet'
import useConnectWallet from '@/components/common/ConnectWallet/useConnectWallet'
import KeyholeIcon from '@/components/common/icons/KeyholeIcon'
import { VisibilityOutlined, AddOutlined } from '@mui/icons-material'

const maxSafes = 3

const Watchlist = ({ closeDrawer }: { closeDrawer?: () => void }): ReactElement => {
  const [lastChainId, setLastChainId] = useState<string | undefined>()
  const [isListExpanded, setIsListExpanded] = useState<boolean>(false)
  const router = useRouter()

  const [safes] = useAllWatchedSafes(isListExpanded ? Infinity : maxSafes, lastChainId)

  const isWelcomePage = router.pathname === AppRoutes.welcome.index || router.pathname === AppRoutes.welcome.socialLogin
  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx

  const safesToShow = useMemo(() => {
    return [safes.slice(0, maxSafes), safes.slice(maxSafes)]
  }, [safes])

  const onShowMore = useCallback(() => {
    if (safes.length > 0) {
      setLastChainId(safes[safes.length - 1].chain.chainId)
      setIsListExpanded((prev) => !prev)
    }
  }, [safes])

  /*
   * Navigate to the dashboard when selecting a safe on the welcome page,
   * navigate to the history when selecting a safe on a single tx page,
   * otherwise keep the current route
   */
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
    <div className={css.container}>
      <div className={css.header}>
        <Typography variant="h5" display="inline" fontWeight={700}>
          <VisibilityOutlined sx={{ verticalAlign: 'middle', marginRight: '10px' }} fontSize="small" />
          Watchlist
        </Typography>

        <Link href={AppRoutes.newSafe.load}>
          <Button
            disableElevation
            size="small"
            onClick={closeDrawer}
            startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
          >
            Add
          </Button>
        </Link>
      </div>

      {!safes && (
        <Box display="flex" flexDirection="column" alignItems="center" py={10}>
          <Typography variant="body2" color="primary.light" textAlign="center" mt={3}>
            Add any Safe account to the watchlist
          </Typography>
        </Box>
      )}

      {!!safes && (
        <List className={css.list}>
          {safesToShow[0].map(({ safeAddress, chain, fiatBalance }) => {
            const href = getHref(chain, safeAddress)
            return (
              <SafeListItem
                key={chain.chainId + safeAddress}
                address={safeAddress}
                chainId={chain.chainId}
                fiatBalance={fiatBalance}
                closeDrawer={closeDrawer}
                href={href}
                shouldScrollToSafe={false}
                isAdded
                isWelcomePage={true}
              />
            )
          })}
        </List>
      )}

      {!isListExpanded && (
        <div className={css.ownedLabelWrapper} onClick={onShowMore}>
          <Typography variant="body2" display="inline" className={css.ownedLabel}>
            More Accounts
            <IconButton disableRipple>
              <ExpandMore />
            </IconButton>
          </Typography>
        </div>
      )}

      {isListExpanded && (
        <List className={css.list}>
          {safesToShow[1].map(({ safeAddress, chain, fiatBalance }) => {
            const href = getHref(chain, safeAddress)
            return (
              <SafeListItem
                key={chain.chainId + safeAddress}
                address={safeAddress}
                chainId={chain.chainId}
                fiatBalance={fiatBalance}
                closeDrawer={closeDrawer}
                href={href}
                shouldScrollToSafe={false}
                isAdded
                isWelcomePage={true}
              />
            )
          })}
        </List>
      )}
    </div>
  )
}

export default Watchlist
