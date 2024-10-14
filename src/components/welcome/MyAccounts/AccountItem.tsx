import { LoopIcon } from '@/features/counterfactual/CounterfactualStatusButton'
import { selectUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import type { SafeOverview } from '@safe-global/safe-gateway-typescript-sdk'
import { useMemo } from 'react'
import { ListItemButton, Box, Typography, Chip, Skeleton } from '@mui/material'
import Link from 'next/link'
import SafeIcon from '@/components/common/SafeIcon'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { AppRoutes } from '@/config/routes'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import ChainIndicator from '@/components/common/ChainIndicator'
import css from './styles.module.css'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
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
import { useGetHref } from './useGetHref'
import { extractCounterfactualSafeSetup, isPredictedSafeProps } from '@/features/counterfactual/utils'
import { useGetSafeOverviewQuery } from '@/store/api/gateway'
import useWallet from '@/hooks/wallets/useWallet'
import { skipToken } from '@reduxjs/toolkit/query'
import { hasMultiChainAddNetworkFeature } from '@/features/multichain/utils/utils'
type AccountItemProps = {
  safeItem: SafeItem
  safeOverview?: SafeOverview
  onLinkClick?: () => void
}

const AccountItem = ({ onLinkClick, safeItem }: AccountItemProps) => {
  const { chainId, address } = safeItem
  const chain = useAppSelector((state) => selectChainById(state, chainId))
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, chainId, address))
  const safeAddress = useSafeAddress()
  const currChainId = useChainId()
  const router = useRouter()
  const isCurrentSafe = chainId === currChainId && sameAddress(safeAddress, address)
  const isWelcomePage = router.pathname === AppRoutes.welcome.accounts
  const { address: walletAddress } = useWallet() ?? {}

  const trackingLabel = isWelcomePage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  const getHref = useGetHref(router)

  const href = useMemo(() => {
    return chain ? getHref(chain, address) : ''
  }, [chain, getHref, address])

  const name = useAppSelector(selectAllAddressBooks)[chainId]?.[address]

  const isActivating = undeployedSafe?.status.status !== 'AWAITING_EXECUTION'

  const counterfactualSetup = undeployedSafe
    ? extractCounterfactualSafeSetup(undeployedSafe, chain?.chainId)
    : undefined

  const addNetworkFeatureEnabled = hasMultiChainAddNetworkFeature(chain)
  const isReplayable =
    addNetworkFeatureEnabled &&
    !safeItem.isWatchlist &&
    (!undeployedSafe || !isPredictedSafeProps(undeployedSafe.props))

  const { data: safeOverview } = useGetSafeOverviewQuery(
    undeployedSafe
      ? skipToken
      : {
          chainId: safeItem.chainId,
          safeAddress: safeItem.address,
          walletAddress,
        },
  )

  return (
    <ListItemButton
      data-testid="safe-list-item"
      selected={isCurrentSafe}
      className={classnames(css.listItem, { [css.currentListItem]: isCurrentSafe })}
    >
      <Track {...OVERVIEW_EVENTS.OPEN_SAFE} label={trackingLabel}>
        <Link onClick={onLinkClick} href={href} className={css.safeLink}>
          <Box pr={2.5}>
            <SafeIcon
              address={address}
              owners={safeOverview?.owners.length ?? counterfactualSetup?.owners.length}
              threshold={safeOverview?.threshold ?? counterfactualSetup?.threshold}
              chainId={chainId}
            />
          </Box>

          <Typography variant="body2" component="div" className={css.safeAddress}>
            {name && (
              <Typography variant="subtitle2" component="p" fontWeight="bold" className={css.safeName}>
                {name}
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

          <ChainIndicator chainId={chainId} responsive onlyLogo className={css.chainIndicator} />

          <Typography variant="body2" fontWeight="bold" textAlign="right" pl={2}>
            {safeOverview ? (
              <FiatValue value={safeOverview.fiatTotal} />
            ) : undeployedSafe ? null : (
              <Skeleton variant="text" sx={{ ml: 'auto' }} />
            )}
          </Typography>
        </Link>
      </Track>

      <SafeListContextMenu name={name} address={address} chainId={chainId} addNetwork={isReplayable} rename />

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
