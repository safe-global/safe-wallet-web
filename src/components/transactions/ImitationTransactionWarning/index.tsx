import type { ReactElement } from 'react'
import Alert from '@mui/material/Alert'
import SvgIcon from '@mui/material/SvgIcon'

import InfoOutlinedIcon from '@/public/images/notifications/info.svg'
import css from './styles.module.css'

export const ImitationTransactionWarning = (): ReactElement => {
  return (
    <Alert
      className={css.alert}
      sx={{ borderLeft: ({ palette }) => `3px solid ${palette['error'].main} !important` }}
      severity="error"
      icon={<SvgIcon component={InfoOutlinedIcon} inheritViewBox color="error" />}
    >
      <b>This may be a malicious transaction.</b> Check and confirm the address before interacting with it.{' '}
    </Alert>
  )
}
