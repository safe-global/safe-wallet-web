import { selectUndeployedSafes } from '@/features/counterfactual/store/undeployedSafesSlice'
import NetworkLogosList from '@/features/multichain/components/NetworkLogosList'
import type { SafeOverview } from '@safe-global/safe-gateway-typescript-sdk'
import { useCallback, useMemo, useState } from 'react'
import {
  ListItemButton,
  Box,
  Typography,
  Skeleton,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Divider,
  Tooltip,
} from '@mui/material'
import SafeIcon from '@/components/common/SafeIcon'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS, trackEvent } from '@/services/analytics'
import { AppRoutes } from '@/config/routes'
import { useAppSelector } from '@/store'
import css from './styles.module.css'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import useSafeAddress from '@/hooks/useSafeAddress'
import { sameAddress } from '@/utils/addresses'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import FiatValue from '@/components/common/FiatValue'
import { type MultiChainSafeItem } from './useAllSafesGrouped'
import { shortenAddress } from '@/utils/formatters'
import { type SafeItem } from './useAllSafes'
import SubAccountItem from './SubAccountItem'
import { getSafeSetups, getSharedSetup, hasMultiChainAddNetworkFeature } from '@/features/multichain/utils/utils'
import { AddNetworkButton } from './AddNetworkButton'
import { isPredictedSafeProps } from '@/features/counterfactual/utils'
import ChainIndicator from '@/components/common/ChainIndicator'
import MultiAccountContextMenu from '@/components/sidebar/SafeListContextMenu/MultiAccountContextMenu'
import { useGetMultipleSafeOverviewsQuery } from '@/store/api/gateway'
import useWallet from '@/hooks/wallets/useWallet'
import { selectCurrency } from '@/store/settingsSlice'
import { selectChains } from '@/store/chainsSlice'

type MultiAccountItemProps = {
  multiSafeAccountItem: MultiChainSafeItem
  safeOverviews?: SafeOverview[]
  onLinkClick?: () => void
}

const MultichainIndicator = ({ safes }: { safes: SafeItem[] }) => {
  return (
    <Tooltip
      title={
        <Box>
          <Typography fontSize="14px">Multichain account on:</Typography>
          {safes.map((safeItem) => (
            <Box p="4px 0px" key={safeItem.chainId}>
              <ChainIndicator chainId={safeItem.chainId} />
            </Box>
          ))}
        </Box>
      }
      arrow
    >
      <Box className={css.multiChains}>
        <NetworkLogosList networks={safes} showHasMore />
      </Box>
    </Tooltip>
  )
}

const MultiAccountItem = ({ onLinkClick, multiSafeAccountItem }: MultiAccountItemProps) => {
  const { address, safes } = multiSafeAccountItem
  const undeployedSafes = useAppSelector(selectUndeployedSafes)
  const safeAddress = useSafeAddress()
  const router = useRouter()
  const isCurrentSafe = sameAddress(safeAddress, address)
  const isWelcomePage = router.pathname === AppRoutes.welcome.accounts
  const [expanded, setExpanded] = useState(isCurrentSafe)
  const chains = useAppSelector(selectChains)

  const deployedChainIds = useMemo(() => safes.map((safe) => safe.chainId), [safes])

  const isWatchlist = useMemo(
    () => multiSafeAccountItem.safes.every((safe) => safe.isWatchlist),
    [multiSafeAccountItem.safes],
  )

  const trackingLabel = isWelcomePage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  const toggleExpand = () => {
    !expanded && trackEvent({ ...OVERVIEW_EVENTS.EXPAND_MULTI_SAFE, label: trackingLabel })
    setExpanded((prev) => !prev)
  }

  const allAddressBooks = useAppSelector(selectAllAddressBooks)
  const name = useMemo(() => {
    return Object.values(allAddressBooks).find((ab) => ab[address] !== undefined)?.[address]
  }, [address, allAddressBooks])

  const currency = useAppSelector(selectCurrency)
  const { address: walletAddress } = useWallet() ?? {}
  const deployedSafes = useMemo(
    () => safes.filter((safe) => undeployedSafes[safe.chainId]?.[safe.address] === undefined),
    [safes, undeployedSafes],
  )
  const { data: safeOverviews } = useGetMultipleSafeOverviewsQuery({ currency, walletAddress, safes: deployedSafes })

  const safeSetups = useMemo(
    () => getSafeSetups(safes, safeOverviews ?? [], undeployedSafes),
    [safeOverviews, safes, undeployedSafes],
  )
  const sharedSetup = getSharedSetup(safeSetups)

  const totalFiatValue = useMemo(
    () => safeOverviews?.reduce((prev, current) => prev + Number(current.fiatTotal), 0),
    [safeOverviews],
  )

  const hasReplayableSafe = useMemo(
    () =>
      safes.some((safeItem) => {
        const undeployedSafe = undeployedSafes[safeItem.chainId]?.[safeItem.address]
        const chain = chains.data.find((chain) => chain.chainId === safeItem.chainId)
        const addNetworkFeatureEnabled = hasMultiChainAddNetworkFeature(chain)

        // We can only replay deployed Safes and new counterfactual Safes.
        return (!undeployedSafe || !isPredictedSafeProps(undeployedSafe.props)) && addNetworkFeatureEnabled
      }),
    [chains.data, safes, undeployedSafes],
  )

  const findOverview = useCallback(
    (item: SafeItem) => {
      return safeOverviews?.find(
        (overview) => item.chainId === overview.chainId && sameAddress(overview.address.value, item.address),
      )
    },
    [safeOverviews],
  )

  return (
    <ListItemButton
      data-testid="safe-list-item"
      selected={isCurrentSafe}
      className={classnames(css.multiListItem, css.listItem, { [css.currentListItem]: isCurrentSafe })}
      sx={{ p: 0 }}
    >
      <Accordion expanded={expanded} sx={{ border: 'none' }}>
        <AccordionSummary
          onClick={toggleExpand}
          sx={{
            pl: 0,
            '& .MuiAccordionSummary-content': { m: '0 !important', alignItems: 'center' },
            '&.Mui-expanded': { backgroundColor: 'transparent !important' },
          }}
        >
          <Box className={css.safeLink} width="100%">
            <Box pr={2.5}>
              <SafeIcon address={address} owners={sharedSetup?.owners.length} threshold={sharedSetup?.threshold} />
            </Box>
            <Typography variant="body2" component="div" className={css.safeAddress}>
              {name && (
                <Typography variant="subtitle2" component="p" fontWeight="bold" className={css.safeName}>
                  {name}
                </Typography>
              )}
              <Typography color="var(--color-primary-light)" fontSize="inherit" component="span">
                {shortenAddress(address)}
              </Typography>
            </Typography>
            <MultichainIndicator safes={safes} />
            <Typography variant="body2" fontWeight="bold" textAlign="right" pl={2}>
              {totalFiatValue !== undefined ? (
                <FiatValue value={totalFiatValue} />
              ) : (
                <Skeleton variant="text" sx={{ ml: 'auto' }} />
              )}
            </Typography>
          </Box>
          <MultiAccountContextMenu
            name={name ?? ''}
            address={address}
            chainIds={deployedChainIds}
            addNetwork={hasReplayableSafe}
          />
        </AccordionSummary>
        <AccordionDetails sx={{ padding: '0px 12px' }}>
          <Box>
            {safes.map((safeItem) => (
              <SubAccountItem
                onLinkClick={onLinkClick}
                safeItem={safeItem}
                key={`${safeItem.chainId}:${safeItem.address}`}
                safeOverview={findOverview(safeItem)}
              />
            ))}
          </Box>
          {!isWatchlist && hasReplayableSafe && (
            <>
              <Divider sx={{ ml: '-12px', mr: '-12px' }} />
              <Box display="flex" alignItems="center" justifyContent="center" sx={{ ml: '-12px', mr: '-12px' }}>
                <AddNetworkButton
                  currentName={name}
                  safeAddress={address}
                  deployedChains={safes.map((safe) => safe.chainId)}
                />
              </Box>
            </>
          )}
        </AccordionDetails>
      </Accordion>
    </ListItemButton>
  )
}

export default MultiAccountItem
