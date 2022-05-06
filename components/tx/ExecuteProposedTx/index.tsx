import { ReactElement } from 'react'
import { getTransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Typography } from '@mui/material'

import { createTransaction, executeTransaction } from '@/services/createTransaction'
import extractTxInfo from '@/services/extractTxInfo'
import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'
import { CodedException, Errors } from '@/services/exceptions'
import { useAppDispatch } from '@/store'
import { showNotification } from '@/store/notificationsSlice'

export const executeTx = async (chainId: string, txSummary: TransactionSummary, safeAddress: string): Promise<void> => {
  try {
    const txDetails = await getTransactionDetails(chainId, txSummary.id)
    const { txParams, signatures } = extractTxInfo(txSummary, txDetails, safeAddress)

    const safeTx = await createTransaction(txParams)
    Object.entries(signatures).forEach(([signer, data]) => {
      safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
    })
    await executeTransaction(chainId, txDetails.txId, safeTx)
  } catch (err) {
    throw new CodedException(Errors._804, (err as Error).message)
  }
}

const ExecuteProposedTx = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const { chainId, address } = useSafeAddress()
  const dispatch = useAppDispatch()

  const onExecute = async () => {
    try {
      await executeTx(chainId, txSummary, address)
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
