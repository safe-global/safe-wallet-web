import React, { useState, type ReactElement, useCallback, useMemo } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import ExpandMore from '@mui/icons-material/ExpandMore'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import Box from '@mui/material/Box'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import AddIcon from '@/public/images/common/add.svg'

import { useWatchedSafes } from '@/hooks/useSafes'
import SafeListItem from '@/components/sidebar/SafeListItem'

import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import { VisibilityOutlined } from '@mui/icons-material'
import classNames from 'classnames'
import { CircularProgress } from '@mui/material'

const maxSafes = 3

const Watchlist = ({
  closeDrawer,
  isWelcomePage,
}: {
  closeDrawer?: () => void
  isWelcomePage: boolean
}): ReactElement => {
  const [isListExpanded, setIsListExpanded] = useState<boolean>(false)
  const router = useRouter()

  const [safes, error, isLoading] = useWatchedSafes()

  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx

  /*
   * Navigate to the dashboard when selecting a safe on the welcome page,
   * navigate to the history when selecting a safe on a single tx page,
   * otherwise keep the current route
   */
  const getHref = useCallback(
    (chain: ChainInfo, address: string) => {
      return {
        pathname: isWelcomePage ? AppRoutes.home : router.pathname,
        query: { ...router.query, safe: `${chain.shortName}:${address}` },
      }
    },
    [isWelcomePage, isSingleTxPage, router.pathname, router.query],
  )

  const safesToShow = useMemo(() => {
    return isListExpanded ? safes : safes.slice(0, maxSafes)
  }, [safes, isListExpanded])

  const onShowMore = useCallback(() => {
    if (safes.length > 0) {
      setIsListExpanded((prev) => !prev)
    }
  }, [safes])

  return (
    <div className={classNames(css.container, { [css.sidebarContainer]: !isWelcomePage })}>
      <div className={css.header}>
        <Typography variant="h5" display="inline" fontWeight={700} className={css.title}>
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

      {isLoading && (
        <Box py={4} textAlign="center">
          <CircularProgress size={20} />
        </Box>
      )}

      {!safes && (
        <Box display="flex" flexDirection="column" alignItems="center" py={10}>
          <Typography variant="body2" color="primary.light" textAlign="center" mt={3}>
            Add any Safe account to the watchlist
          </Typography>
        </Box>
      )}

      {!!safes && (
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

      {!isListExpanded && safes.length > maxSafes && (
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

export default Watchlist
