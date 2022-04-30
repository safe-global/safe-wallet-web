import { ReactElement, useState } from 'react'
import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { getTransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'

import ErrorToast from '@/components/common/ErrorToast'
import { createTransaction, executeTransaction, signTransaction } from '@/services/createTransaction'
import extractTxInfo from '@/services/extractTxInfo'
import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'
import { CodedException, Errors, logError } from '@/services/exceptions'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'

const getTxDetails = async (chainId: string, id: string) => {
  return getTransactionDetails(chainId, id)
}

export const executeTx = async (chainId: string, txSummary: TransactionSummary): Promise<void> => {
  try {
    const txDetails = await getTxDetails(chainId, txSummary.id)
    const { txParams, signatures } = extractTxInfo(txSummary, txDetails)

    const safeTx = await createTransaction(txParams)
    Object.entries(signatures).forEach(([signer, data]) => {
      safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
    })
    await executeTransaction(safeTx)
  } catch (err) {
    throw new CodedException(Errors._804, (err as Error).message)
  }
}

const ExecuteProposedTx = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const { chainId } = useSafeAddress()
  const dispatch = useAppDispatch()

  const onExecute = async () => {
    try {
      await executeTx(chainId, txSummary)
    } catch (err) {
      dispatch(showNotification({ message: (err as Error).message }))
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
    </div>
  )
}

export default ExecuteProposedTx
