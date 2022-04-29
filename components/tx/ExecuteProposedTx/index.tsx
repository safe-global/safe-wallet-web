import { ReactElement, useState } from 'react'
import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { getTransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'

import ErrorToast from '@/components/common/ErrorToast'
import { createTransaction, executeTransaction, signTransaction } from '@/services/createTransaction'
import extractTxInfo from '@/services/extractTxInfo'
import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'

const getTxDetails = async (chainId: string, id: string) => {
  return getTransactionDetails(chainId, id)
}

const ExecuteProposedTx = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const { chainId } = useSafeAddress()
  const [error, setError] = useState<Error>()

  const onExecute = async () => {
    try {
      const txDetails = await getTxDetails(chainId, txSummary.id)
      const { txParams } = extractTxInfo(txSummary, txDetails)

      const safeTx = await createTransaction(txParams)
      await executeTransaction(safeTx)
    } catch (err) {
      setError(err as Error)
    }
  }

  return (
    <div className={css.container}>
      <Typography variant="h6">Execute transaction</Typography>

      <div>Transaction id</div>
      <pre style={{ overflow: 'auto', width: '100%' }}>{txSummary.id}</pre>

      <div className={css.submit}>
        <Button variant="contained" onClick={onExecute}>
          Submit
        </Button>
      </div>

      {error && <ErrorToast message={error.message} />}
    </div>
  )
}

export default ExecuteProposedTx
