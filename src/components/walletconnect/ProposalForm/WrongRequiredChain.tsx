import { Alert } from '@mui/material'
import type { ReactElement } from 'react'

import css from './styles.module.css'

export const WrongRequiredChain = (): ReactElement => {
  return (
    <Alert severity="warning" className={css.alert}>
      The dApp is trying to connect with the wrong network. Approving the session should update it but we advise
      checking in the dApp before transacting.
    </Alert>
  )
}
