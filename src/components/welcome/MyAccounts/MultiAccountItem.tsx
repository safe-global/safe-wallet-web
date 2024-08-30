import { selectUndeployedSafes } from '@/features/counterfactual/store/undeployedSafesSlice'
import type { SafeOverview } from '@safe-global/safe-gateway-typescript-sdk'
import { useMemo, useState } from 'react'
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
import MultiChainIcon from '@/public/images/sidebar/multichain-account.svg'
import { shortenAddress } from '@/utils/formatters'
import { type SafeItem } from './useAllSafes'
import SubAccountItem from './SubAccountItem'
import { getSharedSetup } from './utils/multiChainSafe'
import { AddNetworkButton } from './AddNetworkButton'
import ChainIndicator from '@/components/common/ChainIndicator'
import MultiAccountContextMenu from '@/components/sidebar/SafeListContextMenu/MultiAccountContextMenu'

type MultiAccountItemProps = {
  multiSafeAccountItem: MultiChainSafeItem
  safeOverviews?: SafeOverview[]
  onLinkClick?: () => void
}

const MultiAccountItem = ({ onLinkClick, multiSafeAccountItem, safeOverviews }: MultiAccountItemProps) => {
  const { address, safes } = multiSafeAccountItem
  const undeployedSafes = useAppSelector(selectUndeployedSafes)
  const safeAddress = useSafeAddress()
  const router = useRouter()
  const isCurrentSafe = sameAddress(safeAddress, address)
  const isWelcomePage = router.pathname === AppRoutes.welcome.accounts
  const [expanded, setExpanded] = useState(isCurrentSafe)

  const deployedChains = useMemo(() => safes.map((safe) => safe.chainId), [safes])

  const isWatchlist = useMemo(
    () => multiSafeAccountItem.safes.every((safe) => safe.isWatchlist),
    [multiSafeAccountItem.safes],
  )

  const trackingLabel = isWelcomePage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  const toggleExpand = () => {
    trackEvent({ ...OVERVIEW_EVENTS.EXPAND_MULTI_SAFE, label: trackingLabel })
    setExpanded((prev) => !prev)
  }

  const allAddressBooks = useAppSelector(selectAllAddressBooks)
  const name = useMemo(() => {
    return Object.values(allAddressBooks).find((ab) => ab[address] !== undefined)?.[address]
  }, [address, allAddressBooks])

  const sharedSetup = useMemo(
    () => getSharedSetup(safes, safeOverviews ?? [], undeployedSafes),
    [safeOverviews, safes, undeployedSafes],
  )

  const totalFiatValue = useMemo(
    () => safeOverviews?.reduce((prev, current) => prev + Number(current.fiatTotal), 0),
    [safeOverviews],
  )

  const findOverview = (item: SafeItem) => {
    return safeOverviews?.find(
      (overview) => item.chainId === overview.chainId && sameAddress(overview.address.value, item.address),
    )
  }

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
            '& .MuiAccordionSummary-content': { m: 0, alignItems: 'center' },
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
            <Typography variant="body2" fontWeight="bold" textAlign="right" pr={4}>
              {totalFiatValue !== undefined ? (
                <FiatValue value={totalFiatValue} />
              ) : (
                <Skeleton variant="text" sx={{ ml: 'auto' }} />
              )}
            </Typography>
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
              <Box height="26px">
                <MultiChainIcon />
              </Box>
            </Tooltip>
          </Box>
          <MultiAccountContextMenu name={name ?? ''} address={address} chainIds={deployedChains} />
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
          {!isWatchlist && (
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
