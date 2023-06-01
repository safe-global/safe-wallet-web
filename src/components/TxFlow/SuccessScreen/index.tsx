import StatusMessage from '@/components/TxFlow/SuccessScreen/StatusMessage'
import StatusStepper from '@/components/TxFlow/SuccessScreen/StatusStepper'
import { AppRoutes } from '@/config/routes'
import useSafeAddress from '@/hooks/useSafeAddress'
import useTxStatus from '@/hooks/useTxStatus'
import { TxEvent } from '@/services/tx/txEvents'
import { Button, Divider, Paper } from '@mui/material'
import classnames from 'classnames'
import Link from 'next/link'
import { type UrlObject } from 'url'
import css from './styles.module.css'

export const SuccessScreen = ({ txId }: { txId: string }) => {
  const { status } = useTxStatus()
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
        {/* TODO: improve conditions  */}
        <StatusMessage status={status} isError={status !== TxEvent.FAILED} />
      </div>

      <Divider />
      <div className={css.row}>
        <StatusStepper status={status} txId={txId} />
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
