import CheckIcon from '@mui/icons-material/Check'
import { SvgIcon, Typography } from '@mui/material'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'
import { useCallback } from 'react'

import CopyButton from '@/components/common/CopyButton'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import ShareIcon from '@/public/images/common/share.svg'
import { SAFE_APPS_EVENTS, trackSafeAppEvent } from '@/services/analytics'
import css from './styles.module.css'

type CustomAppProps = {
  safeApp: SafeAppData
  shareUrl: string
}

const CustomApp = ({ safeApp, shareUrl }: CustomAppProps) => {
  const handleCopy = useCallback(() => {
    trackSafeAppEvent(SAFE_APPS_EVENTS.COPY_SHARE_URL, safeApp.name)
  }, [safeApp])

  return (
    <div data-sid="90680" className={css.customAppContainer}>
      <SafeAppIconCard src={safeApp.iconUrl} alt={safeApp.name} width={48} height={48} />

      <Typography component="h2" mt={2} color="text.primary" fontWeight={700}>
        {safeApp.name}
      </Typography>

      <Typography variant="body2" mt={1} color="text.secondary">
        {safeApp.description}
      </Typography>

      {shareUrl ? (
        <CopyButton
          className={css.customAppCheckIcon}
          text={shareUrl}
          initialToolTipText={`Copy share URL for ${safeApp.name}`}
          onCopy={handleCopy}
        >
          <SvgIcon component={ShareIcon} inheritViewBox color="border" fontSize="small" />
        </CopyButton>
      ) : (
        <CheckIcon color="success" className={css.customAppCheckIcon} />
      )}
    </div>
  )
}

export default CustomApp
