import { ReactElement, useState } from 'react'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Typography } from '@mui/material'

import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'
import { useChainId } from '@/services/useChainId'
import { createExistingTx, dispatchTxExecution } from '@/services/tx/txSender'
import { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import useAsync from '@/services/useAsync'
import useGasLimit from '@/services/useGasLimit'
import ErrorToast from '@/components/common/ErrorToast'

type ReviewNewTxProps = {
  txSummary: TransactionSummary
  onSubmit: (data: null) => void
}

const ExecuteProposedTx = ({ txSummary, onSubmit }: ReviewNewTxProps): ReactElement => {
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)

  const [safeTx, safeTxError, safeTxLoading] = useAsync<SafeTransaction>(() => {
    return createExistingTx(chainId, safeAddress, txSummary)
  }, [txSummary, safeAddress, chainId])

  const { gasLimit, gasLimitError, gasLimitLoading } = useGasLimit(safeTx?.data)

  const onExecute = async () => {
    if (!safeTx) return

    setIsSubmittable(false)

    try {
      await dispatchTxExecution(txSummary.id, safeTx, { gasLimit })
    } catch {
      setIsSubmittable(true)
      return
    }

    onSubmit(null)
  }

  return (
    <div className={css.container}>
      <Typography variant="h6">Execute transaction</Typography>

      <label>
        <div>Gas limit</div>
        <input readOnly disabled={safeTxLoading || gasLimitLoading} value={gasLimit || ''} />
      </label>

      <div className={css.submit}>
        <Button variant="contained" onClick={onExecute} disabled={!isSubmittable}>
          Submit
        </Button>
      </div>

      {safeTxError || gasLimitError ? (
        <ErrorToast message={(safeTxError || gasLimitError)!.message.slice(0, 300)} />
      ) : null}
    </div>
  )
}

export default ExecuteProposedTx
