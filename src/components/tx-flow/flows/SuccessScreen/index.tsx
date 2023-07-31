import { useRouter } from 'next/router'
import StatusMessage from './StatusMessage'
import StatusStepper from './StatusStepper'
import { AppRoutes } from '@/config/routes'
import { Button, Container, Divider, Paper } from '@mui/material'
import classnames from 'classnames'
import Link from 'next/link'
import { type UrlObject } from 'url'
import css from './styles.module.css'
import { useAppSelector } from '@/store'
import { selectPendingTxById } from '@/store/pendingTxsSlice'
import { useEffect, useState } from 'react'
import { getTxLink } from '@/hooks/useTxNotifications'
import { useCurrentChain } from '@/hooks/useChains'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import useSafeInfo from '@/hooks/useSafeInfo'

export const SuccessScreen = ({ txId }: { txId: string }) => {
  const [localTxHash, setLocalTxHash] = useState<string>()
  const [error, setError] = useState<Error>()
  const router = useRouter()
  const chain = useCurrentChain()
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, txId))
  const { safeAddress } = useSafeInfo()
  const { txHash = '', status } = pendingTx || {}

  useEffect(() => {
    if (!txHash) return

    setLocalTxHash(txHash)
  }, [txHash])

  useEffect(() => {
    const unsubFns: Array<() => void> = ([TxEvent.FAILED, TxEvent.REVERTED] as const).map((event) =>
      txSubscribe(event, (detail) => {
        if (detail.txId === txId) setError(detail.error)
      }),
    )

    return () => unsubFns.forEach((unsubscribe) => unsubscribe())
  }, [txId])

  const homeLink: UrlObject = {
    pathname: AppRoutes.home,
    query: { safe: router.query.safe },
  }

  const txLink = chain && getTxLink(txId, chain, safeAddress)

  return (
    <Container
      component={Paper}
      disableGutters
      sx={{
        textAlign: 'center',
        maxWidth: `${900 - 75}px`, // md={11}
      }}
      maxWidth={false}
    >
      <div className={css.row}>
        <StatusMessage status={status} error={error} />
      </div>

      {!error && (
        <>
          <Divider />
          <div className={css.row}>
            <StatusStepper status={status} txHash={localTxHash} />
          </div>
        </>
      )}

      <Divider />
      <div className={classnames(css.row, css.buttons)}>
        <Link href={homeLink} passHref>
          <Button variant="outlined" size="small">
            Back to dashboard
          </Button>
        </Link>
        {txLink && (
          <Link {...txLink} passHref target="_blank" rel="noreferrer">
            <Button variant="outlined" size="small">
              View transaction
            </Button>
          </Link>
        )}
      </div>
    </Container>
  )
}
