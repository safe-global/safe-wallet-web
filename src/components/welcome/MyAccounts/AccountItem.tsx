import ChainIndicator from '@/components/common/ChainIndicator'
import SafeIcon from '@/components/common/SafeIcon'
import Track from '@/components/common/Track'
import SafeListContextMenu from '@/components/sidebar/SafeListContextMenu'
import { AppRoutes } from '@/config/routes'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { useAppSelector } from '@/store'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import { selectChainById } from '@/store/chainsSlice'
import { sameAddress } from '@/utils/addresses'
import { shortenAddress } from '@/utils/formatters'
import { Box, ListItemButton, Typography } from '@mui/material'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import classnames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useMemo } from 'react'
import css from './styles.module.css'

type AccountItemProps = {
  chainId: string
  address: string
  threshold?: number
  owners?: number
  onLinkClick?: () => void
}

const AccountItem = ({ onLinkClick, chainId, address, ...rest }: AccountItemProps) => {
  const chain = useAppSelector((state) => selectChainById(state, chainId))
  const safeAddress = useSafeAddress()
  const currChainId = useChainId()
  const router = useRouter()
  const isCurrentSafe = chainId === currChainId && sameAddress(safeAddress, address)
  const isWelcomePage = router.pathname === AppRoutes.welcome.accounts
  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx

  const trackingLabel = isWelcomePage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  /**
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

  const href = useMemo(() => {
    return chain ? getHref(chain, address) : ''
  }, [chain, getHref, address])

  const name = useAppSelector(selectAllAddressBooks)[chainId]?.[address]

  return (
    <ListItemButton
      data-testid="safe-list-item"
      selected={isCurrentSafe}
      className={classnames(css.listItem, { [css.currentListItem]: isCurrentSafe })}
    >
      <Track {...OVERVIEW_EVENTS.OPEN_SAFE} label={trackingLabel}>
        <Link onClick={onLinkClick} href={href} className={css.safeLink}>
          <SafeIcon address={address} {...rest} />

          <Typography variant="body2" component="div" className={css.safeAddress}>
            {name && (
              <Typography fontWeight="bold" fontSize="inherit">
                {name}
              </Typography>
            )}
            {chain?.shortName}:
            <Typography color="var(--color-primary-light)" fontSize="inherit" component="span">
              {shortenAddress(address)}
            </Typography>
          </Typography>

          <Box data-sid="22946" flex={1} />

          <ChainIndicator chainId={chainId} responsive />
        </Link>
      </Track>

      <SafeListContextMenu name={name} address={address} chainId={chainId} />
    </ListItemButton>
  )
}

export default AccountItem
