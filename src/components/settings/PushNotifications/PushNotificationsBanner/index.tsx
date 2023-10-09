import { useEffect, useRef, type ReactElement } from 'react'
import { Button, Chip, Grid, SvgIcon, Typography, IconButton } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { CustomTooltip } from '@/components/common/CustomTooltip'
import { AppRoutes } from '@/config/routes'
import { useAppSelector } from '@/store'
import { selectAddedSafes, selectAllAddedSafes } from '@/store/addedSafesSlice'
import PushNotificationIcon from '@/public/images/notifications/push-notification.svg'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useNotificationRegistrations } from '../hooks/useNotificationRegistrations'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'
import { trackEvent } from '@/services/analytics'
import useSafeInfo from '@/hooks/useSafeInfo'
import useChainId from '@/hooks/useChainId'
import CheckWallet from '@/components/common/CheckWallet'
import CloseIcon from '@/public/images/common/close.svg'
import { useNotificationPreferences } from '../hooks/useNotificationPreferences'
import { sameAddress } from '@/utils/addresses'
import useOnboard from '@/hooks/wallets/useOnboard'
import { assertWalletChain } from '@/services/tx/tx-sender/sdk'
import { useCurrentChain, useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import useWallet from '@/hooks/wallets/useWallet'
import type { AddedSafesOnChain } from '@/store/addedSafesSlice'
import type { PushNotificationPreferences } from '@/services/push-notifications/preferences'
import type { NotifiableSafes } from '../logic'

import css from './styles.module.css'

const DISMISS_PUSH_NOTIFICATIONS_KEY = 'dismissPushNotifications'

export const useDismissPushNotificationsBanner = () => {
  const addedSafes = useAppSelector(selectAllAddedSafes)
  const { safe } = useSafeInfo()

  const [dismissedBannerPerChain = {}, setDismissedBannerPerChain] = useLocalStorage<{
    [chainId: string]: { [safeAddress: string]: boolean }
  }>(DISMISS_PUSH_NOTIFICATIONS_KEY)

  const dismissPushNotificationBanner = (chainId: string) => {
    const safesOnChain = Object.keys(addedSafes[chainId] || {})

    if (safesOnChain.length === 0) {
      return
    }

    const dismissedSafesOnChain = safesOnChain.reduce<{ [safeAddress: string]: boolean }>((acc, safeAddress) => {
      acc[safeAddress] = true
      return acc
    }, {})

    setDismissedBannerPerChain((prev) => ({
      ...prev,
      [safe.chainId]: dismissedSafesOnChain,
    }))
  }

  const isPushNotificationBannerDismissed = !!dismissedBannerPerChain[safe.chainId]?.[safe.address.value]

  return {
    dismissPushNotificationBanner,
    isPushNotificationBannerDismissed,
  }
}

export const _getSafesToRegister = (
  chainId: string,
  addedSafesOnChain: AddedSafesOnChain,
  allPreferences: PushNotificationPreferences | undefined,
): NotifiableSafes => {
  const addedSafeAddressesOnChain = Object.keys(addedSafesOnChain)

  if (!allPreferences) {
    return { [chainId]: addedSafeAddressesOnChain }
  }

  const notificationRegistrations = Object.values(allPreferences)

  const newlyAddedSafes = addedSafeAddressesOnChain.filter((safeAddress) => {
    return !notificationRegistrations.some(
      (registration) => chainId === registration.chainId && sameAddress(registration.safeAddress, safeAddress),
    )
  })

  return { [chainId]: newlyAddedSafes }
}

type BannerProps = {
  children: ReactElement
  onDismiss?: () => void
  onCustomize?: () => void
  onEnableAll?: () => void
}

const Banner = ({ children, onDismiss, onEnableAll, onCustomize }: BannerProps) => {
  const { chainName = '' } = useCurrentChain() || {}
  const { query } = useRouter()

  return (
    <CustomTooltip
      className={css.banner}
      title={
        <Grid container className={css.container}>
          <Grid item xs={3}>
            <Chip label="New" className={css.chip} />
            <SvgIcon component={PushNotificationIcon} inheritViewBox fontSize="inherit" className={css.icon} />
          </Grid>

          <Grid item xs={9}>
            <Typography variant="subtitle2" fontWeight={700}>
              Enable push notifications
            </Typography>

            <IconButton onClick={onDismiss} className={css.close}>
              <SvgIcon component={CloseIcon} inheritViewBox color="border" fontSize="small" />
            </IconButton>

            <Typography mt={0.5} mb={1.5} variant="body2">
              Get notified about pending signatures, incoming and outgoing transactions for all Safe Accounts on{' '}
              {chainName} when {`Safe{Wallet}`} is in the background or closed.
            </Typography>

            {/* Cannot wrap singular button as it causes style inconsistencies */}
            <CheckWallet>
              {(isOk) => (
                <div className={css.buttons}>
                  <Button
                    variant="contained"
                    size="small"
                    className={css.button}
                    onClick={onEnableAll}
                    disabled={!isOk}
                  >
                    Enable all
                  </Button>

                  <Link passHref href={{ pathname: AppRoutes.settings.notifications, query }} onClick={onCustomize}>
                    <Button variant="outlined" size="small" className={css.button}>
                      Customize
                    </Button>
                  </Link>
                </div>
              )}
            </CheckWallet>
          </Grid>
        </Grid>
      }
      open
    >
      <span>{children}</span>
    </CustomTooltip>
  )
}

const useEnableAll = (addedSafes: AddedSafesOnChain | undefined) => {
  const chainId = useChainId()
  const onboard = useOnboard()
  const { getAllPreferences } = useNotificationPreferences()
  const { registerNotifications } = useNotificationRegistrations()

  return async () => {
    if (!onboard || !addedSafes) return

    const allPreferences = getAllPreferences()
    const safesToRegister = _getSafesToRegister(chainId, addedSafes, allPreferences)

    await assertWalletChain(onboard, chainId)
    await registerNotifications(safesToRegister)
  }
}

const useShowBanner = (addedSafes: AddedSafesOnChain | undefined): boolean => {
  const isNotificationFeatureEnabled = useHasFeature(FEATURES.PUSH_NOTIFICATIONS)
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const { getPreferences } = useNotificationPreferences()
  const { isPushNotificationBannerDismissed } = useDismissPushNotificationsBanner()

  const isSafeAdded = !!addedSafes?.[safeAddress]
  const isSafeRegistered = getPreferences(safe.chainId, safeAddress)

  const shouldShowBanner =
    isNotificationFeatureEnabled && !isPushNotificationBannerDismissed && isSafeAdded && !isSafeRegistered && !!wallet

  return shouldShowBanner
}

export const PushNotificationsBanner = ({ children }: { children: ReactElement }): ReactElement => {
  const chainId = useChainId()
  const addedSafesOnChain = useAppSelector((state) => selectAddedSafes(state, chainId))
  const { dismissPushNotificationBanner } = useDismissPushNotificationsBanner()
  const hasTracked = useRef(false)
  const enableAll = useEnableAll(addedSafesOnChain)
  const shouldShowBanner = useShowBanner(addedSafesOnChain)

  // Track the banner impression
  useEffect(() => {
    if (!shouldShowBanner || hasTracked.current) return
    trackEvent(PUSH_NOTIFICATION_EVENTS.SHOW_BANNER)
    hasTracked.current = true
  }, [shouldShowBanner])

  // Dismiss the banner
  const dismissBanner = () => {
    dismissPushNotificationBanner(chainId)
  }

  // On dismiss, track the event and dismiss the banner
  const onDismiss = () => {
    trackEvent(PUSH_NOTIFICATION_EVENTS.DISMISS_BANNER)
    dismissBanner()
  }

  // On enable all, track the event and enable all notifications
  const onEnableAll = async () => {
    trackEvent(PUSH_NOTIFICATION_EVENTS.ENABLE_ALL)
    try {
      await enableAll()
    } catch {
      return
    }
    dismissBanner()
  }

  // On customize, track the event and navigate to the settings page
  const onCustomize = () => {
    trackEvent(PUSH_NOTIFICATION_EVENTS.CUSTOMIZE_SETTINGS)
    dismissBanner()
  }

  if (!shouldShowBanner) {
    return children
  }

  return (
    <Banner onDismiss={onDismiss} onEnableAll={onEnableAll} onCustomize={onCustomize}>
      {children}
    </Banner>
  )
}
