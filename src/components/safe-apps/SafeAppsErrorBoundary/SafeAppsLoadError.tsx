import Typography from '@mui/material/Typography'
import Link from '@mui/material/Link'
import Button from '@mui/material/Button'
import SvgIcon from '@mui/material/SvgIcon'
import OpenInNew from '@mui/icons-material/OpenInNew'
import { SAFE_APPS_SUPPORT_CHAT_URL } from '@/config/constants'
import NetworkError from '@/public/images/apps/network-error.svg'

import css from './styles.module.css'

type SafeAppsLoadErrorProps = {
  onBackToApps: () => void
}

const SafeAppsLoadError = ({ onBackToApps }: SafeAppsLoadErrorProps): React.ReactElement => {
  return (
    <div className={css.wrapper}>
      <div className={css.content}>
        <Typography variant="h1">Safe App could not be loaded</Typography>

        <SvgIcon component={NetworkError} inheritViewBox className={css.image} />

        <div>
          <Typography component="span">In case the problem persists, please reach out to us via </Typography>
          <Link target="_blank" href={SAFE_APPS_SUPPORT_CHAT_URL} fontSize="medium">
            Discord
            <OpenInNew fontSize="small" color="primary" className={css.icon} />
          </Link>
        </div>

        <Button href="#back" color="primary" onClick={onBackToApps}>
          Go back to the Safe Apps list
        </Button>
      </div>
    </div>
  )
}

export default SafeAppsLoadError
