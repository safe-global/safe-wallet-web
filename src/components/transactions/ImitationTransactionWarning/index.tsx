import type { ReactElement } from 'react'
import { Alert, SvgIcon, Typography } from '@mui/material'

import InfoOutlinedIcon from '@/public/images/notifications/info.svg'
import css from './styles.module.css'
import Link from 'next/link'

export const ImitationTransactionWarning = (): ReactElement => {
  return (
    <Alert
      className={css.alert}
      sx={{ borderLeft: ({ palette }) => `3px solid ${palette['error'].main} !important` }}
      severity="error"
      icon={<SvgIcon component={InfoOutlinedIcon} inheritViewBox color="error" />}
    >
      <b>This may be a malicious transaction.</b> Check and confirm the address before interacting with it.{' '}
      <Link href="">
        <Typography fontSize="14px" fontWeight={700} display="inline" sx={{ textDecoration: 'underline' }}>
          Learn more
        </Typography>
      </Link>
    </Alert>
  )
}

export const MaliciousAddressWarning = (): ReactElement => {
  return (
    <Alert
      className={css.alert}
      severity="error"
      // variant="outlined"
      sx={{ border: 'none' }}
      icon={<SvgIcon component={InfoOutlinedIcon} inheritViewBox color="error" />}
    >
      <b>Poisoned address detected. </b> This address was used in a potentially fraudulent transaction. Please, check
      and confirm this address before interacting with it.{' '}
    </Alert>
  )
}

// const isPoisonedAddress = (outgoingTransactions: Transaction[] | undefined, address: string) => {
//   if (!outgoingTransactions) return
//   const imitationTransactions = outgoingTransactions.filter(({ transaction }) => {
//     return (
//       isTransferTxInfo(transaction.txInfo) &&
//       sameAddress(transaction.txInfo.recipient.value, address) &&
//       isImitation(transaction)
//     )
//   })

//   return imitationTransactions.length > 0
// }
