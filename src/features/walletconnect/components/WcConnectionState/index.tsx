import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'
import ConnectionDots from '@/public/images/common/connection-dots.svg'
import SafeLogo from '@/public/images/logo-no-text.svg'
import { SvgIcon, Typography } from '@mui/material'
import type { CoreTypes } from '@walletconnect/types'
import classNames from 'classnames'
import css from './styles.module.css'

const WcConnectionState = ({ metadata, isDelete }: { metadata?: CoreTypes.Metadata; isDelete: boolean }) => {
  const name = metadata?.name || 'dApp'
  const icon = metadata?.icons[0] || ''

  return (
    <div data-sid="53988" className={css.container}>
      <div>
        <SafeLogo alt="Safe logo" width="28px" height="28px" />

        <SvgIcon
          component={ConnectionDots}
          inheritViewBox
          sx={{ mx: 2 }}
          className={classNames(css.dots, { [css.errorDots]: isDelete })}
        />

        <SafeAppIconCard src={icon} width={28} height={28} alt={`${name} logo`} />
      </div>

      <Typography variant="h5" mt={3}>
        {isDelete ? `${name} disconnected` : `${name} successfully connected!`}
      </Typography>
    </div>
  )
}

export default WcConnectionState
