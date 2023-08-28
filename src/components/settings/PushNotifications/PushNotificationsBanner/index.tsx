import { Button, Chip, SvgIcon, Typography } from '@mui/material'
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

import css from './styles.module.css'

const LS_KEY = 'dismissPushNotifications'

export const PushNotificationsBanner = ({ children }: { children: ReactElement }): ReactElement => {
  const [dismissedBanner = false, setDismissedBanner] = useLocalStorage<boolean>(LS_KEY)
  const addedSafes = useAppSelector(selectAllAddedSafes)
  const totalAddedSafes = useAppSelector(selectTotalAdded)

  const { query } = useRouter()
  const safe = Array.isArray(query.safe) ? query.safe[0] : query.safe

  const { registerNotifications } = useNotificationRegistrations()

  const dismissBanner = useCallback(() => {
    trackEvent(PUSH_NOTIFICATION_EVENTS.DISMISS_BANNER)

    setDismissedBanner(true)
  }, [setDismissedBanner])

  // Click outside to dismiss banner
  useEffect(() => {
    if (dismissedBanner) {
      return
    }

    trackEvent(PUSH_NOTIFICATION_EVENTS.DISPLAY_BANNER)

    document.addEventListener('click', dismissBanner)
    return () => {
      document.removeEventListener('click', dismissBanner)
    }
  }, [dismissBanner, dismissedBanner])

  const onEnableAll = () => {
    trackEvent(PUSH_NOTIFICATION_EVENTS.ENABLE_ALL)

    const safesToRegister = transformAddedSafes(addedSafes)
    registerNotifications(safesToRegister)

    dismissBanner()
  }

  const onCustomize = () => {
    trackEvent(PUSH_NOTIFICATION_EVENTS.CUSTOMIZE_SETTINGS)

    dismissBanner()
  }

  if (dismissedBanner) {
    return children
  }

  return (
    <CustomTooltip
      className={css.banner}
      title={
        <div className={css.container}>
          <div className={css.content}>
            <div className={css.text}>
              <div className={css.title}>
                <Chip label="New" className={css.chip} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Enable push notifications
                </Typography>
              </div>
              <Typography mt={0.5} mb={1.5} variant="body2">
                Easily track your Safe Account activity with broswer push notifications.
              </Typography>
            </div>
            <SvgIcon component={PushNotificationIcon} inheritViewBox fontSize="inherit" className={css.icon} />
          </div>
          <div className={css.buttons}>
            {totalAddedSafes > 0 && (
              <Button variant="contained" size="small" className={css.button} onClick={onEnableAll}>
                Enable all
              </Button>
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
        </div>
      }
      open
    >
      <span>{children}</span>
    </CustomTooltip>
  )
}
