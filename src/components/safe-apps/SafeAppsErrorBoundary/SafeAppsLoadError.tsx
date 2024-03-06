import { DISCORD_URL } from '@/config/constants'
import NetworkError from '@/public/images/apps/network-error.svg'
import Button from '@mui/material/Button'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'

import ExternalLink from '@/components/common/ExternalLink'
import css from './styles.module.css'

type SafeAppsLoadErrorProps = {
  onBackToApps: () => void
}

const SafeAppsLoadError = ({ onBackToApps }: SafeAppsLoadErrorProps): React.ReactElement => {
  return (
    <div data-sid="36120" className={css.wrapper}>
      <div data-sid="25080" className={css.content}>
        <Typography variant="h1">Safe App could not be loaded</Typography>

        <SvgIcon component={NetworkError} inheritViewBox className={css.image} />

        <div>
          <Typography component="span">In case the problem persists, please reach out to us via </Typography>
          <ExternalLink href={DISCORD_URL} fontSize="medium">
            Discord
          </ExternalLink>
        </div>

        <Button data-sid="36193" href="#back" color="primary" onClick={onBackToApps}>
          Go back to the Safe Apps list
        </Button>
      </div>
    </div>
  )
}

export default SafeAppsLoadError
