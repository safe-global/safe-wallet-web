import { ReactElement } from 'react'
import type { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import useSafeAddress from '@/services/useSafeAddress'
import { useChainId } from '@/services/useChainId'
import { createExistingTx } from '@/services/tx/txSender'
import useAsync from '@/services/useAsync'
import useWallet from '@/services/wallets/useWallet'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { isExecutable, isSignableBy } from '@/components/transactions/utils'

type ConfirmProposedTxProps = {
  txSummary: TransactionSummary
  onSubmit: (data: null) => void
}

const ConfirmProposedTx = ({ txSummary, onSubmit }: ConfirmProposedTxProps): ReactElement => {
  const wallet = useWallet()
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const txId = txSummary.id
  const canExecute = isExecutable(txSummary, wallet?.address || '')
  const canSign = isSignableBy(txSummary, wallet?.address || '')

  const [safeTx, safeTxError] = useAsync<SafeTransaction>(() => {
    return createExistingTx(chainId, safeAddress, txSummary)
  }, [txSummary, safeAddress, chainId])

  return (
    <SignOrExecuteForm
      safeTx={safeTx}
      txId={txId}
      onSubmit={onSubmit}
      isExecutable={canExecute}
      onlyExecute={!canSign}
      title={canSign ? 'Confirm transaction' : 'Execute transaction'}
      error={safeTxError}
    />
  )
}

export default ConfirmProposedTx
