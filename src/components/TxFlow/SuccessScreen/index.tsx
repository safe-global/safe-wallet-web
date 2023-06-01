import StatusMessage from '@/components/TxFlow/SuccessScreen/StatusMessage'
import StatusStepper from '@/components/TxFlow/SuccessScreen/StatusStepper'
import { AppRoutes } from '@/config/routes'
import useSafeAddress from '@/hooks/useSafeAddress'
import { Button, Divider, Paper } from '@mui/material'
import classnames from 'classnames'
import Link from 'next/link'
import { type UrlObject } from 'url'
import css from './styles.module.css'
import { useAppSelector } from '@/store'
import { selectPendingTxById } from '@/store/pendingTxsSlice'
import { useEffect, useState } from 'react'

export const SuccessScreen = ({ txId }: { txId: string }) => {
  const [localTxHash, setLocalTxHash] = useState<string>('')
  const safeAddress = useSafeAddress()
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, txId))
  const { txHash = '', status } = pendingTx || {}

  useEffect(() => {
    if (!txHash) return

    setLocalTxHash(txHash)
  }, [txHash])

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
        <StatusMessage status={status} isError={false} />
      </div>

      <Divider />
      <div className={css.row}>
        <StatusStepper status={status} txHash={localTxHash} />
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
