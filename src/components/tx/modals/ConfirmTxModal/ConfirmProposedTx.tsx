import { ReactElement } from 'react'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import useSafeAddress from '@/hooks/useSafeAddress'
import { useChainId } from '@/hooks/useChainId'
import { createExistingTx } from '@/services/tx/txSender'
import useAsync from '@/hooks/useAsync'
import useWallet from '@/hooks/wallets/useWallet'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { isExecutable, isSignableBy, isNextTx } from '@/utils/transaction-guards'
import { Skeleton, Typography } from '@mui/material'
import useTxQueue from '@/hooks/useTxQueue'

type ConfirmProposedTxProps = {
  txSummary: TransactionSummary
  onSubmit: (txId: string) => void
}

const SIGN_TEXT = 'Sign this transaction.'
const EXECUTE_TEXT = 'Submit the form to execute this transaction.'
const SIGN_EXECUTE_TEXT = 'Sign or immediately execute this transaction.'

const ConfirmProposedTx = ({ txSummary, onSubmit }: ConfirmProposedTxProps): ReactElement => {
  const wallet = useWallet()
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const { page } = useTxQueue()

  const txId = txSummary.id
  const canExecute = isExecutable(txSummary, wallet?.address || '') && isNextTx(txId, page?.results || [])
  const canSign = isSignableBy(txSummary, wallet?.address || '')

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    return createExistingTx(chainId, safeAddress, txId)
  }, [txId, safeAddress, chainId])

  const text = canSign ? (canExecute ? SIGN_EXECUTE_TEXT : SIGN_TEXT) : EXECUTE_TEXT

  return (
    <SignOrExecuteForm
      safeTx={safeTx}
      txId={txId}
      onSubmit={onSubmit}
      isExecutable={canExecute}
      onlyExecute={!canSign}
      error={safeTxError}
    >
      <Typography mb={2}>{text}</Typography>

      <Typography mb={3}>
        Transaction nonce:&nbsp;
        {safeTx ? (
          <b>{safeTx?.data.nonce}</b>
        ) : (
          <Skeleton variant="text" sx={{ display: 'inline-block', minWidth: '2em' }} />
        )}
      </Typography>
    </SignOrExecuteForm>
  )
}

export default ConfirmProposedTx
