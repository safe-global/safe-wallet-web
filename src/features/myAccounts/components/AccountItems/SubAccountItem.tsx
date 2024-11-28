import { selectUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import type { SafeOverview } from '@safe-global/safe-gateway-typescript-sdk'
import { useMemo, useRef } from 'react'
import { ListItemButton, Box, Typography, Skeleton, useMediaQuery, useTheme } from '@mui/material'
import Link from 'next/link'
import SafeIcon from '@/components/common/SafeIcon'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS, OVERVIEW_LABELS } from '@/services/analytics'
import { AppRoutes } from '@/config/routes'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import css from './styles.module.css'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import SafeListContextMenu from '@/components/sidebar/SafeListContextMenu'
import useSafeAddress from '@/hooks/useSafeAddress'
import useChainId from '@/hooks/useChainId'
import { sameAddress } from '@/utils/addresses'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import type { SafeItem } from '@/features/myAccounts/hooks/useAllSafes'
import FiatValue from '@/components/common/FiatValue'
import { useGetHref } from '@/features/myAccounts/hooks/useGetHref'
import { extractCounterfactualSafeSetup } from '@/features/counterfactual/utils'
import useOnceVisible from '@/hooks/useOnceVisible'
import { AccountInfoChips } from '../AccountInfoChips'

type SubAccountItem = {
  safeItem: SafeItem
  safeOverview?: SafeOverview
  onLinkClick?: () => void
}

const SubAccountItem = ({ onLinkClick, safeItem, safeOverview }: SubAccountItem) => {
  const { chainId, address } = safeItem
  const chain = useAppSelector((state) => selectChainById(state, chainId))
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, chainId, address))
  const safeAddress = useSafeAddress()
  const currChainId = useChainId()
  const router = useRouter()
  const isCurrentSafe = chainId === currChainId && sameAddress(safeAddress, address)
  const isWelcomePage = router.pathname === AppRoutes.welcome.accounts
  const elementRef = useRef<HTMLDivElement>(null)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isVisible = useOnceVisible(elementRef)

  const trackingLabel = isWelcomePage ? OVERVIEW_LABELS.login_page : OVERVIEW_LABELS.sidebar

  const getHref = useGetHref(router)

  const href = useMemo(() => {
    return chain ? getHref(chain, address) : ''
  }, [chain, getHref, address])

  const name = useAppSelector(selectAllAddressBooks)[chainId]?.[address]

  const isActivating = undeployedSafe?.status.status !== 'AWAITING_EXECUTION'

  const cfSafeSetup = extractCounterfactualSafeSetup(undeployedSafe, chain?.chainId)

  return (
    <ListItemButton
      ref={elementRef}
      data-testid="safe-list-item"
      selected={isCurrentSafe}
      className={classnames(css.listItem, { [css.currentListItem]: isCurrentSafe }, css.subItem)}
    >
      <Track {...OVERVIEW_EVENTS.OPEN_SAFE} label={trackingLabel}>
        <Link onClick={onLinkClick} href={href} className={classnames(css.safeLink, css.safeSubLink)}>
          <Box sx={{ pr: 2.5 }}>
            <SafeIcon
              address={address}
              owners={safeOverview?.owners.length ?? cfSafeSetup?.owners.length}
              threshold={safeOverview?.threshold ?? cfSafeSetup?.threshold}
              isSubItem
              chainId={chainId}
            />
          </Box>

          <Typography variant="body2" component="div" className={css.safeAddress}>
            {name && (
              <Typography
                variant="subtitle2"
                component="p"
                className={css.safeName}
                sx={{
                  fontWeight: 'bold',
                }}
              >
                {name}
              </Typography>
            )}
            <Typography
              component="span"
              sx={{
                color: 'var(--color-primary-light)',
                fontSize: 'inherit',
              }}
            >
              {chain?.chainName}
            </Typography>
            {!isMobile && (
              <AccountInfoChips
                isActivating={isActivating}
                isReadOnly={safeItem.isReadOnly}
                undeployedSafe={!!undeployedSafe}
                isVisible={isVisible}
                safeOverview={safeOverview ?? null}
                chain={chain}
                href={href}
                onLinkClick={onLinkClick}
                trackingLabel={trackingLabel}
              />
            )}
          </Typography>

          <Typography variant="body2" fontWeight="bold" textAlign="right" sx={{ pr: 5 }}>
            {undeployedSafe ? null : safeOverview ? (
              <FiatValue value={safeOverview.fiatTotal} />
            ) : (
              <Skeleton variant="text" />
            )}
          </Typography>
        </Link>
      </Track>

      <SafeListContextMenu
        name={name}
        address={address}
        chainId={chainId}
        addNetwork={!undeployedSafe}
        rename={!undeployedSafe}
        undeployedSafe={!!undeployedSafe}
      />

      {isMobile && (
        <AccountInfoChips
          isActivating={isActivating}
          isReadOnly={safeItem.isReadOnly}
          undeployedSafe={!!undeployedSafe}
          isVisible={isVisible}
          safeOverview={safeOverview ?? null}
          chain={chain}
          href={href}
          onLinkClick={onLinkClick}
          trackingLabel={trackingLabel}
        />
      )}
    </ListItemButton>
  )
}

export default SubAccountItem
