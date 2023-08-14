import StatusMessage from './StatusMessage'
import StatusStepper from './StatusStepper'
import { Button, Container, Divider, Paper } from '@mui/material'
import classnames from 'classnames'
import Link from 'next/link'
import css from './styles.module.css'
import { useAppSelector } from '@/store'
import { selectPendingTxById } from '@/store/pendingTxsSlice'
import { useEffect, useState, useCallback, useContext } from 'react'
import { getTxLink } from '@/hooks/useTxNotifications'
import { useCurrentChain } from '@/hooks/useChains'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import useSafeInfo from '@/hooks/useSafeInfo'
import { TxModalContext } from '../..'

export const SuccessScreen = ({ txId }: { txId: string }) => {
  const [localTxHash, setLocalTxHash] = useState<string>()
  const [error, setError] = useState<Error>()
  const { setTxFlow } = useContext(TxModalContext)
  const chain = useCurrentChain()
  const pendingTx = useAppSelector((state) => selectPendingTxById(state, txId))
  const { safeAddress } = useSafeInfo()
  const { txHash = '', status } = pendingTx || {}
  const txLink = chain && getTxLink(txId, chain, safeAddress)

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

  const onFinishClick = useCallback(() => {
    setTxFlow(undefined)
  }, [setTxFlow])

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
        {txLink && (
          <Link {...txLink} passHref target="_blank" rel="noreferrer">
            <Button variant="outlined" size="small">
              View transaction
            </Button>
          </Link>
        )}

        <Button variant="contained" size="small" onClick={onFinishClick}>
          Finish
        </Button>
      </div>
    </Container>
  )
}
