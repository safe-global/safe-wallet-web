import { Button, Chip, Grid, IconButton, SvgIcon, Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'

import CheckWallet from '@/components/common/CheckWallet'
import { CustomTooltip } from '@/components/common/CustomTooltip'
import { AppRoutes } from '@/config/routes'
import { useCurrentChain, useHasFeature } from '@/hooks/useChains'
import useDebounce from '@/hooks/useDebounce'
import useSafeInfo from '@/hooks/useSafeInfo'
import useOnboard from '@/hooks/wallets/useOnboard'
import useWallet from '@/hooks/wallets/useWallet'
import CloseIcon from '@/public/images/common/close.svg'
import PushNotificationIcon from '@/public/images/notifications/push-notification.svg'
import { trackEvent } from '@/services/analytics'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import type { PushNotificationPreferences } from '@/services/push-notifications/preferences'
import { assertWalletChain } from '@/services/tx/tx-sender/sdk'
import { useAppSelector } from '@/store'
import type { AddedSafesOnChain } from '@/store/addedSafesSlice'
import { selectAddedSafes, selectAllAddedSafes, selectTotalAdded } from '@/store/addedSafesSlice'
import { sameAddress } from '@/utils/addresses'
import { FEATURES } from '@/utils/chains'
import CircularProgress from '@mui/material/CircularProgress'
import { useNotificationPreferences } from '../hooks/useNotificationPreferences'
import { useNotificationRegistrations } from '../hooks/useNotificationRegistrations'
import type { NotifiableSafes } from '../logic'
import css from './styles.module.css'

const DISMISS_PUSH_NOTIFICATIONS_KEY = 'dismissPushNotifications'
const BANNER_DELAY = 3000

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

const TrackBanner = (): null => {
  const hasTracked = useRef(false)

  useEffect(() => {
    if (hasTracked.current) {
      return
    }

    trackEvent(PUSH_NOTIFICATION_EVENTS.SHOW_BANNER)
    hasTracked.current = true
  }, [])

  return null
}

export const PushNotificationsBanner = ({ children }: { children: ReactElement }): ReactElement => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const isNotificationFeatureEnabled = useHasFeature(FEATURES.PUSH_NOTIFICATIONS)
  const chain = useCurrentChain()
  const totalAddedSafes = useAppSelector(selectTotalAdded)
  const { safe, safeAddress } = useSafeInfo()
  const addedSafesOnChain = useAppSelector((state) => selectAddedSafes(state, safe.chainId))
  const { query } = useRouter()
  const onboard = useOnboard()
  const wallet = useWallet()

  const { getPreferences, getAllPreferences } = useNotificationPreferences()
  const { dismissPushNotificationBanner, isPushNotificationBannerDismissed } = useDismissPushNotificationsBanner()

  const isSafeAdded = !!addedSafesOnChain?.[safeAddress]
  const isSafeRegistered = getPreferences(safe.chainId, safeAddress)
  const shouldShowBanner = useDebounce(
    isNotificationFeatureEnabled &&
      !isPushNotificationBannerDismissed &&
      isSafeAdded &&
      !isSafeRegistered &&
      !!wallet &&
      safe.deployed,
    BANNER_DELAY,
  )

  const { registerNotifications } = useNotificationRegistrations()

  const dismissBanner = useCallback(() => {
    dismissPushNotificationBanner(safe.chainId)
  }, [dismissPushNotificationBanner, safe.chainId])

  const onDismiss = () => {
    trackEvent(PUSH_NOTIFICATION_EVENTS.DISMISS_BANNER)
    dismissBanner()
  }

  const onEnableAll = async () => {
    if (!onboard || !addedSafesOnChain) {
      return
    }

    setIsSubmitting(true)

    trackEvent(PUSH_NOTIFICATION_EVENTS.ENABLE_ALL)

    const allPreferences = getAllPreferences()
    const safesToRegister = _getSafesToRegister(safe.chainId, addedSafesOnChain, allPreferences)

    try {
      await assertWalletChain(onboard, safe.chainId)
    } catch {
      setIsSubmitting(false)
      return
    }

    await registerNotifications(safesToRegister)

    setIsSubmitting(false)
    dismissBanner()
  }

  const onCustomize = () => {
    trackEvent(PUSH_NOTIFICATION_EVENTS.CUSTOMIZE_SETTINGS)

    dismissBanner()
  }

  if (!shouldShowBanner || isPushNotificationBannerDismissed) {
    return children
  }

  return (
    <>
      <TrackBanner />
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
                {chain?.chainName} when Safe
                {`{Wallet}`} is in the background or closed.
              </Typography>
              {/* Cannot wrap singular button as it causes style inconsistencies */}
              <CheckWallet>
                {(isOk) => (
                  <div data-sid="48724" className={css.buttons}>
                    {totalAddedSafes > 0 && (
                      <Button
                        data-sid="21139"
                        variant="contained"
                        size="small"
                        className={css.button}
                        onClick={onEnableAll}
                        startIcon={isSubmitting ? <CircularProgress size={12} color="inherit" /> : null}
                        disabled={!isOk || !onboard || isSubmitting}
                      >
                        Enable all
                      </Button>
                    )}
                    {safe && (
                      <Link passHref href={{ pathname: AppRoutes.settings.notifications, query }} onClick={onCustomize}>
                        <Button data-sid="21495" variant="outlined" size="small" className={css.button}>
                          Customize
                        </Button>
                      </Link>
                    )}
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
    </>
  )
}
