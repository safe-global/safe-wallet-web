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
import AddIcon from '@/public/images/common/add.svg'

import { useWatchedSafes } from '@/hooks/useSafes'
import SafeListItem from '@/components/sidebar/SafeListItem'

import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import { VisibilityOutlined } from '@mui/icons-material'
import classNames from 'classnames'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import Track from '../Track'
import useChains from '@/hooks/useChains'

const MAX_SAFES = 5

const Watchlist = ({
  closeDrawer,
  isWelcomePage,
}: {
  closeDrawer?: () => void
  isWelcomePage: boolean
}): ReactElement => {
  const [isListExpanded, setIsListExpanded] = useState<boolean>(false)
  const router = useRouter()
  const { configs } = useChains()

  const safes = useWatchedSafes()

  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx

  /*
   * Navigate to the dashboard when selecting a safe on the welcome page,
   * navigate to the history when selecting a safe on a single tx page,
   * otherwise keep the current route
   */
  const getHref = useCallback(
    (chainId: string, address: string) => {
      const chain = configs.find((chain) => chain.chainId === chainId)
      return {
        pathname: isWelcomePage ? AppRoutes.home : isSingleTxPage ? AppRoutes.transactions.history : router.pathname,
        query: { ...router.query, safe: `${chain?.shortName}:${address}` },
      }
    },
    [isWelcomePage, isSingleTxPage, router.pathname, router.query, configs],
  )

  const safesToShow = useMemo(() => {
    return isListExpanded ? safes : safes.slice(0, MAX_SAFES)
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

        <Track {...OVERVIEW_EVENTS.ADD_SAFE}>
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
        </Track>
      </div>

      {!safes.length && (
        <Box display="flex" flexDirection="column" alignItems="center" sx={{ paddingY: '26px' }}>
          <Typography variant="body2" color="primary.light" textAlign="center">
            Add any Safe account to the watchlist
          </Typography>
        </Box>
      )}

      {!!safes && (
        <List className={css.list}>
          {safesToShow.map(({ address: safeAddress, chainId }) => {
            const href = getHref(chainId, safeAddress)
            return (
              <SafeListItem
                key={chainId + safeAddress}
                address={safeAddress}
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

export default Watchlist
