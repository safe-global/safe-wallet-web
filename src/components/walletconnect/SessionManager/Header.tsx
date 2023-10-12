import { SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import WalletConnect from '@/public/images/common/walletconnect.svg'
import Alert from '@/public/images/notifications/alert.svg'

import css from './styles.module.css'

export const WalletConnectHeader = ({ error }: { error?: boolean }): ReactElement => {
  return (
    <>
      <div>
        <SvgIcon component={WalletConnect} inheritViewBox className={css.icon} />
        {error && <SvgIcon component={Alert} inheritViewBox className={css.errorBadge} fontSize="small" />}
      </div>

      <Typography variant="h5" mt={2} mb={0.5}>
        Connect dApp to {`Safe{Wallet}`}
      </Typography>
    </>
  )
}
