import type { SafeAppData } from '@gnosis.pm/safe-react-gateway-sdk'

import { Typography, SvgIcon } from '@mui/material'
import CheckIcon from '@mui/icons-material/Check'
import CopyButton from '@/components/common/CopyButton'
import ShareIcon from '@/public/images/common/share.svg'

import css from './styles.module.css'

type CustomAppProps = {
  safeApp: SafeAppData
  shareUrl: string
}

const CustomApp = ({ safeApp, shareUrl }: CustomAppProps) => {
  return (
    <div className={css.customAppContainer}>
      <img className={css.customAppIcon} src={safeApp.iconUrl} alt={safeApp.name}></img>

      <Typography mt={2} color="text.primary" fontWeight={700}>
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
