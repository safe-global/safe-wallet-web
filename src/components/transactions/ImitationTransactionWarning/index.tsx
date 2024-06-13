import type { ReactElement } from 'react'
import { Alert, SvgIcon } from '@mui/material'
import type { AlertColor } from '@mui/material'

import InfoOutlinedIcon from '@/public/images/notifications/info.svg'
import css from './styles.module.css'
import Link from 'next/link'

export const ImitationTransactionWarning = ({
  severity,
}: {
  datatestid?: String
  title: string | ReactElement
  text: string
  severity: AlertColor
}): ReactElement => {
  return (
    <Alert
      className={css.alert}
      sx={{ borderLeft: ({ palette }) => `3px solid ${palette['error'].main} !important` }}
      severity="error"
      icon={<SvgIcon component={InfoOutlinedIcon} inheritViewBox color={severity} />}
    >
      <b>This may be a malicious transaction.</b> Check and confirm the address before interacting with it.
      <Link href="">Learn more</Link>
    </Alert>
  )
}
