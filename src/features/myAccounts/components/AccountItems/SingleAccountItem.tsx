import { selectUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import { type SafeOverview } from '@safe-global/safe-gateway-typescript-sdk'
import { useMemo, useRef } from 'react'
import { ListItemButton, Box, Typography, IconButton, SvgIcon, Skeleton, useTheme, useMediaQuery } from '@mui/material'
import Link from 'next/link'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS, PIN_SAFE_LABELS, trackEvent } from '@/services/analytics'
import { AppRoutes } from '@/config/routes'
import { useAppDispatch, useAppSelector } from '@/store'
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
import type { SafeItem } from '@/features/myAccounts/hooks/useAllSafes'
import { useGetHref } from '@/features/myAccounts/hooks/useGetHref'
import { extractCounterfactualSafeSetup, isPredictedSafeProps } from '@/features/counterfactual/utils'
import useWallet from '@/hooks/wallets/useWallet'
import { hasMultiChainAddNetworkFeature } from '@/features/multichain/utils/utils'
import BookmarkIcon from '@/public/images/apps/bookmark.svg'
import BookmarkedIcon from '@/public/images/apps/bookmarked.svg'
import { addOrUpdateSafe, pinSafe, selectAddedSafes, unpinSafe } from '@/store/addedSafesSlice'
import SafeIcon from '@/components/common/SafeIcon'
import useOnceVisible from '@/hooks/useOnceVisible'
import { skipToken } from '@reduxjs/toolkit/query'
import { defaultSafeInfo, useGetSafeOverviewQuery } from '@/store/slices'
import FiatValue from '@/components/common/FiatValue'
import QueueActions from '../QueueActions'
import { AccountStatusChip, ReadOnlyChip } from '../AccountInfoChips'

type AccountItemProps = {
  safeItem: SafeItem
  safeOverview?: SafeOverview
  onLinkClick?: () => void
}

const AccountItem = ({ onLinkClick, safeItem }: AccountItemProps) => {
  const { chainId, address, isPinned, isWatchlist } = safeItem
  const chain = useAppSelector((state) => selectChainById(state, chainId))
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, chainId, address))
  const safeAddress = useSafeAddress()
  const currChainId = useChainId()
  const router = useRouter()
  const isCurrentSafe = chainId === currChainId && sameAddress(safeAddress, address)
  const isWelcomePage = router.pathname === AppRoutes.welcome.accounts
  const { address: walletAddress } = useWallet() ?? {}
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, chainId))
  const isAdded = !!addedSafes?.[address]
  const elementRef = useRef<HTMLDivElement>(null)
  const isVisible = useOnceVisible(elementRef)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const dispatch = useAppDispatch()

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
    undeployedSafe || !isVisible
      ? skipToken
      : {
          chainId: safeItem.chainId,
          safeAddress: safeItem.address,
          walletAddress,
        },
  )

  const safeThreshold = safeOverview?.threshold ?? counterfactualSetup?.threshold ?? defaultSafeInfo.threshold
  const safeOwners =
    safeOverview?.owners ?? counterfactualSetup?.owners.map((address) => ({ value: address })) ?? defaultSafeInfo.owners

  const addToPinnedList = () => {
    if (!isAdded && !undeployedSafe) {
      dispatch(
        addOrUpdateSafe({
          safe: {
            ...defaultSafeInfo,
            chainId,
            address: { value: address },
            owners: safeOwners,
            threshold: safeThreshold,
          },
        }),
      )
      dispatch(pinSafe({ chainId, address, removeOnUnpin: true }))
    } else {
      dispatch(pinSafe({ chainId, address, removeOnUnpin: false }))
    }
    trackEvent({ ...OVERVIEW_EVENTS.PIN_SAFE, label: PIN_SAFE_LABELS.pin })
  }

  const removeFromPinnedList = () => {
    dispatch(unpinSafe({ chainId, address }))
    trackEvent({ ...OVERVIEW_EVENTS.PIN_SAFE, label: PIN_SAFE_LABELS.unpin })
  }

  const showQueueActions = isVisible && !undeployedSafe && !isWatchlist

  return (
    <ListItemButton
      ref={elementRef}
      data-testid="safe-list-item"
      selected={isCurrentSafe}
      className={classnames(css.listItem, { [css.currentListItem]: isCurrentSafe })}
    >
      <Track {...OVERVIEW_EVENTS.OPEN_SAFE} label={trackingLabel}>
        <Link onClick={onLinkClick} href={href} className={css.safeLink}>
          <Box pr={2.5}>
            <SafeIcon
              address={address}
              owners={safeOwners.length > 0 ? safeOwners.length : undefined}
              threshold={safeThreshold > 0 ? safeThreshold : undefined}
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
            {!isMobile && (
              <Box width="100%">
                {undeployedSafe ? (
                  <AccountStatusChip isActivating={isActivating} />
                ) : isWatchlist ? (
                  <ReadOnlyChip />
                ) : null}

                {showQueueActions && (
                  <QueueActions
                    queued={safeOverview?.queued || 0}
                    awaitingConfirmation={safeOverview?.awaitingConfirmation || 0}
                    safeAddress={address}
                    chainShortName={chain?.shortName || ''}
                  />
                )}
              </Box>
            )}
          </Typography>

          <ChainIndicator chainId={chainId} responsive onlyLogo className={css.chainIndicator} />

          <Typography variant="body2" fontWeight="bold" textAlign="right" pl={2}>
            {undeployedSafe ? null : safeOverview ? (
              <FiatValue value={safeOverview.fiatTotal} />
            ) : (
              <Skeleton variant="text" sx={{ ml: 'auto' }} />
            )}
          </Typography>
        </Link>
      </Track>
      <IconButton edge="end" size="medium" sx={{ mx: 1 }} onClick={isPinned ? removeFromPinnedList : addToPinnedList}>
        <SvgIcon
          component={isPinned ? BookmarkedIcon : BookmarkIcon}
          inheritViewBox
          color={isPinned ? 'primary' : undefined}
          fontSize="small"
        />
      </IconButton>
      <SafeListContextMenu name={name} address={address} chainId={chainId} addNetwork={isReplayable} rename />

      {isMobile && (
        <Box width="100%">
          <Track {...OVERVIEW_EVENTS.OPEN_SAFE} label={trackingLabel}>
            <Link onClick={onLinkClick} href={href}>
              <Box px={2} pb={2} className={css.chipSection}>
                {undeployedSafe ? (
                  <AccountStatusChip isActivating={isActivating} />
                ) : isWatchlist ? (
                  <ReadOnlyChip />
                ) : null}
              </Box>
            </Link>
          </Track>

          {showQueueActions && (
            <QueueActions
              isMobile
              queued={safeOverview?.queued || 0}
              awaitingConfirmation={safeOverview?.awaitingConfirmation || 0}
              safeAddress={address}
              chainShortName={chain?.shortName || ''}
            />
          )}
        </Box>
      )}
    </ListItemButton>
  )
}

export default AccountItem
