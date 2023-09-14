import { Button, Chip, Grid, SvgIcon, Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useCallback, useEffect } from 'react'
import type { ReactElement } from 'react'

import { CustomTooltip } from '@/components/common/CustomTooltip'
import { AppRoutes } from '@/config/routes'
import { useAppSelector } from '@/store'
import { selectAllAddedSafes, selectTotalAdded } from '@/store/addedSafesSlice'
import PushNotificationIcon from '@/public/images/notifications/push-notification.svg'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import { useNotificationRegistrations } from '../hooks/useNotificationRegistrations'
import { transformAddedSafes } from '../GlobalPushNotifications'
import { PUSH_NOTIFICATION_EVENTS } from '@/services/analytics/events/push-notifications'
import { trackEvent } from '@/services/analytics'
import useSafeInfo from '@/hooks/useSafeInfo'
import CheckWallet from '@/components/common/CheckWallet'

import css from './styles.module.css'

const DISMISS_NOTIFICATION_KEY = 'dismissPushNotifications'

export const PushNotificationsBanner = ({ children }: { children: ReactElement }): ReactElement => {
  const addedSafes = useAppSelector(selectAllAddedSafes)
  const totalAddedSafes = useAppSelector(selectTotalAdded)
  const { safe } = useSafeInfo()
  const { query } = useRouter()

  const [dismissedBannerPerChain = {}, setDismissedBannerPerChain] = useLocalStorage<{
    [chainId: string]: boolean
  }>(DISMISS_NOTIFICATION_KEY)

  const hasAddedSafesOnChain = Object.values(addedSafes[safe.chainId] || {}).length > 0
  const dismissedBanner = !!dismissedBannerPerChain[safe.chainId]

  const shouldShowBanner = !dismissedBanner && hasAddedSafesOnChain

  const { registerNotifications } = useNotificationRegistrations()

  const dismissBanner = useCallback(() => {
    trackEvent(PUSH_NOTIFICATION_EVENTS.DISMISS_BANNER)

    setDismissedBannerPerChain((prev) => ({
      ...prev,
      [safe.chainId]: true,
    }))
  }, [safe.chainId, setDismissedBannerPerChain])

  // Click outside to dismiss banner
  useEffect(() => {
    if (!shouldShowBanner) {
      return
    }

    trackEvent(PUSH_NOTIFICATION_EVENTS.DISPLAY_BANNER)

    document.addEventListener('click', dismissBanner)
    return () => {
      document.removeEventListener('click', dismissBanner)
    }
  }, [dismissBanner, shouldShowBanner])

  const onEnableAll = async () => {
    trackEvent(PUSH_NOTIFICATION_EVENTS.ENABLE_ALL)

    const safesToRegister = transformAddedSafes(addedSafes)
    await registerNotifications(safesToRegister)

    dismissBanner()
  }

  const onCustomize = () => {
    trackEvent(PUSH_NOTIFICATION_EVENTS.CUSTOMIZE_SETTINGS)

    dismissBanner()
  }

  if (!shouldShowBanner) {
    return children
  }

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
            <Typography mt={0.5} mb={1.5} variant="body2">
              Get notified about pending signatures, incoming and outgoing transactions and more when Safe{`{Wallet}`}{' '}
              is in the background or closed.
            </Typography>
            <div className={css.buttons}>
              {totalAddedSafes > 0 && (
                <CheckWallet>
                  {(isOk) => (
                    <Button
                      variant="contained"
                      size="small"
                      className={css.button}
                      onClick={onEnableAll}
                      disabled={!isOk}
                    >
                      Enable all
                    </Button>
                  )}
                </CheckWallet>
              )}
              {safe && (
                <Link
                  passHref
                  legacyBehavior
                  href={{ pathname: AppRoutes.settings.notifications, query }}
                  onClick={onCustomize}
                >
                  <Button variant="outlined" size="small" className={css.button}>
                    Customize
                  </Button>
                </Link>
              )}
            </div>
          </Grid>
        </Grid>
      }
      open
    >
      <span>{children}</span>
    </CustomTooltip>
  )
}
