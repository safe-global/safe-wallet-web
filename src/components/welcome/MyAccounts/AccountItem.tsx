import { LoopIcon } from '@/features/counterfactual/CounterfactualStatusButton'
import { selectUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import type { ChainInfo, SafeOverview } from '@safe-global/safe-gateway-typescript-sdk'
import { useCallback, useMemo } from 'react'
import { ListItemButton, Box, Typography, Chip } from '@mui/material'
import Link from 'next/link'
import SafeIcon from '@/components/common/SafeIcon'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { AppRoutes } from '@/config/routes'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import ChainIndicator from '@/components/common/ChainIndicator'
import css from './styles.module.css'
import { shortenAddress } from '@/utils/formatters'
import SafeListContextMenu from '@/components/sidebar/SafeListContextMenu'
import useSafeAddress from '@/hooks/useSafeAddress'
import useChainId from '@/hooks/useChainId'
import { sameAddress } from '@/utils/addresses'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import type { SafeItem } from './useAllSafes'
import FiatValue from '@/components/common/FiatValue'
import QueueActions from './QueueActions'
import { useAddressResolver } from '@/hooks/useAddressResolver'

type AccountItemProps = {
  safeItem: SafeItem
  safeOverview?: SafeOverview
  onLinkClick?: () => void
}

const AccountItem = ({ onLinkClick, safeItem, safeOverview }: AccountItemProps) => {
  const { chainId, address } = safeItem || {}
  const chain = useAppSelector((state) => selectChainById(state, chainId))
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, chainId, address))
  const safeAddress = useSafeAddress()
  const currChainId = useChainId()
  const router = useRouter()
  const isCurrentSafe = chainId === currChainId && sameAddress(safeAddress, address)
  const isWelcomePage = router.pathname === AppRoutes.welcome.accounts
  const isSingleTxPage = router.pathname === AppRoutes.transactions.tx
  const trackingLabel = isWelcomePage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar
  const { name, ens } = useAddressResolver(address, chainId)
  const safeName = name ?? ens

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

  const isActivating = undeployedSafe?.status.status !== 'AWAITING_EXECUTION'

  return (
    <ListItemButton
      data-testid="safe-list-item"
      selected={isCurrentSafe}
      className={classnames(css.listItem, { [css.currentListItem]: isCurrentSafe })}
    >
      <Track {...OVERVIEW_EVENTS.OPEN_SAFE} label={trackingLabel}>
        <Link onClick={onLinkClick} href={href} className={css.safeLink}>
          <Box pr={2.5}>
            <SafeIcon address={address} owners={safeOverview?.owners.length} threshold={safeOverview?.threshold} />
          </Box>

          <Typography variant="body2" component="div" className={css.safeAddress}>
            {safeName && (
              <Typography variant="subtitle2" component="p" fontWeight="bold">
                {safeName}
              </Typography>
            )}
            {chain?.shortName}:
            <Typography color="var(--color-primary-light)" fontSize="inherit" component="span">
              {shortenAddress(address)}
            </Typography>
            {undeployedSafe && (
              <div>
                <Chip
                  size="small"
                  label={isActivating ? 'Activating account' : 'Not activated'}
                  icon={
                    isActivating ? (
                      <LoopIcon fontSize="small" className={css.pendingLoopIcon} sx={{ mr: '-4px', ml: '4px' }} />
                    ) : (
                      <ErrorOutlineIcon fontSize="small" color="warning" />
                    )
                  }
                  className={classnames(css.chip, {
                    [css.pendingAccount]: isActivating,
                  })}
                />
              </div>
            )}
          </Typography>

          <Typography variant="body2" fontWeight="bold">
            {safeOverview?.fiatTotal && <FiatValue value={safeOverview.fiatTotal} />}
          </Typography>

          <ChainIndicator chainId={chainId} responsive />
        </Link>
      </Track>

      <SafeListContextMenu name={name} address={address} chainId={chainId} />

      <QueueActions
        queued={safeOverview?.queued || 0}
        awaitingConfirmation={safeOverview?.awaitingConfirmation || 0}
        safeAddress={address}
        chainShortName={chain?.shortName || ''}
      />
    </ListItemButton>
  )
}

export default AccountItem
