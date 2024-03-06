import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { getTxLink } from '@/hooks/useTxNotifications'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'
import { useAppSelector } from '@/store'
import { selectPendingTxById } from '@/store/pendingTxsSlice'
import { Button, Container, Divider, Paper } from '@mui/material'
import classnames from 'classnames'
import Link from 'next/link'
import { useCallback, useContext, useEffect, useState } from 'react'
import { TxModalContext } from '../..'
import StatusMessage from './StatusMessage'
import StatusStepper from './StatusStepper'
import css from './styles.module.css'

const SuccessScreen = ({ txId }: { txId: string }) => {
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

  const onClose = useCallback(() => {
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
      <div data-sid="30330" className={css.row}>
        <StatusMessage status={status} error={error} />
      </div>

      {!error && (
        <>
          <Divider />
          <div data-sid="63683" className={css.row}>
            <StatusStepper status={status} txHash={localTxHash} />
          </div>
        </>
      )}

      <Divider />

      <div data-sid="30217" className={classnames(css.row, css.buttons)}>
        {txLink && (
          <Link {...txLink} passHref target="_blank" rel="noreferrer" legacyBehavior>
            <Button
              data-sid="18149"
              data-testid="view-transaction-btn"
              variant="outlined"
              size="small"
              onClick={onClose}
            >
              View transaction
            </Button>
          </Link>
        )}

        <Button
          data-sid="40784"
          data-testid="finish-transaction-btn"
          variant="contained"
          size="small"
          onClick={onClose}
        >
          Finish
        </Button>
      </div>
    </Container>
  )
}

export default SuccessScreen
