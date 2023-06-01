import StatusMessage, { TransactionStatus } from '@/components/TxFlow/SuccessScreen/StatusMessage'
import { AppRoutes } from '@/config/routes'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Button, Divider, Paper } from '@mui/material'
import classnames from 'classnames'
import Link from 'next/link'
import { type UrlObject } from 'url'
import css from './styles.module.css'

export const SuccessScreen = () => {
  const safeAddress = useSafeAddress()

  const homeLink: UrlObject = {
    pathname: AppRoutes.home,
    query: { safe: safeAddress },
  }

  return (
    <Paper
      sx={{
        textAlign: 'center',
      }}
    >
      <div className={css.row}>
        {/* TODO: replace hardcoded values  */}
        <StatusMessage status={TransactionStatus.PROCESSING} isError={false} />
      </div>

      <Divider />
      <div className={css.row}>
        <h3>placeholder</h3>
      </div>

      <Divider />
      <div className={classnames(css.row, css.buttons)}>
        <Link href={homeLink} passHref>
          <Button variant="outlined" size="small">
            Back to dashboard
          </Button>
        </Link>
        <Button variant="outlined" size="small">
          View transaction
        </Button>
      </div>
    </Paper>
  )
}
