import { Typography } from '@mui/material'
import type { ReactElement } from 'react'

import { WalletConnectHeader } from './Header'

import css from './styles.module.css'

export const WalletConnectErrorMessage = ({ error }: { error: Error }): ReactElement => {
  return (
    <div className={css.errorContainer}>
      <WalletConnectHeader error />
      <Typography title={error.message} className={css.errorMessage}>
        {error.message}
      </Typography>
    </div>
  )
}
