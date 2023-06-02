import { type ReactElement, useContext, useEffect } from 'react'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import useSafeInfo from '@/hooks/useSafeInfo'
import { useChainId } from '@/hooks/useChainId'
import useAsync from '@/hooks/useAsync'
import useWallet from '@/hooks/wallets/useWallet'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { isExecutable, isSignableBy } from '@/utils/transaction-guards'
import { DialogContent, Typography } from '@mui/material'
import { createExistingTx } from '@/services/tx/tx-sender'
import TxLayout from '@/components/TxFlow/common/TxLayout'
import { SafeTxContext } from '../SafeTxProvider'

type ConfirmProposedTxProps = {
  txSummary: TransactionSummary
  onSubmit: () => void
}

const SIGN_TEXT = 'Sign this transaction.'
const EXECUTE_TEXT = 'Submit the form to execute this transaction.'
const SIGN_EXECUTE_TEXT = 'Sign or immediately execute this transaction.'

const ConfirmProposedTx = ({ txSummary, onSubmit }: ConfirmProposedTxProps): ReactElement => {
  const wallet = useWallet()
  const { safe, safeAddress } = useSafeInfo()
  const chainId = useChainId()
  const { setSafeTx, setSafeTxError } = useContext(SafeTxContext)

  const txId = txSummary.id
  const canExecute = isExecutable(txSummary, wallet?.address || '', safe)
  const canSign = isSignableBy(txSummary, wallet?.address || '')

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    return createExistingTx(chainId, safeAddress, txId)
  }, [txId, safeAddress, chainId])

  // Update the SafeTxContext with the SafeTransaction
  useEffect(() => {
    setSafeTx(safeTx)
    setSafeTxError(safeTxError)
  }, [safeTx, safeTxError, setSafeTx, setSafeTxError])

  const text = canSign ? (canExecute ? SIGN_EXECUTE_TEXT : SIGN_TEXT) : EXECUTE_TEXT

  return (
    <TxLayout title="Confirm transaction" txSummary={txSummary}>
      <DialogContent>
        <Typography mb={2}>{text}</Typography>

        <SignOrExecuteForm txId={txId} onSubmit={onSubmit} isExecutable={canExecute} onlyExecute={!canSign} />
      </DialogContent>
    </TxLayout>
  )
}

export default ConfirmProposedTx
