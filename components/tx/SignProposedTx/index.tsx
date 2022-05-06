import { ReactElement, useState } from 'react'
import { getTransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'

import { createTransaction, signTransaction } from '@/services/createTransaction'
import extractTxInfo from '@/services/extractTxInfo'
import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'
import { executeTx } from '@/components/tx/ExecuteProposedTx'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'
import { CodedException, Errors } from '@/services/exceptions'

export const signTx = async (chainId: string, txSummary: TransactionSummary, safeAddress: string) => {
  try {
    const txDetails = await getTransactionDetails(chainId, txSummary.id)
    const { txParams, signatures } = extractTxInfo(txSummary, txDetails, safeAddress)

    const safeTx = await createTransaction(txParams)
    Object.entries(signatures).forEach(([signer, data]) => {
      safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
    })

    await signTransaction(safeTx)
  } catch (err) {
    throw new CodedException(Errors._814, (err as Error).message)
  }
}

const SignProposedTx = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const { chainId, address } = useSafeAddress()
  const dispatch = useAppDispatch()
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)

  const onSign = async () => {
    try {
      await signTx(chainId, txSummary, address)
    } catch (err) {
      dispatch(showNotification({ message: (err as Error).message }))
    }
  }

  const onExecute = async () => {
    try {
      await executeTx(chainId, txSummary, address)
    } catch (err) {
      dispatch(showNotification({ message: (err as Error).message }))
    }
  }

  const handleSubmit = shouldExecute ? onExecute : onSign

  return (
    <div className={css.container}>
      <Typography variant="h6">Confirm transaction</Typography>

      <FormGroup>
        <FormControlLabel
          control={<Checkbox checked={shouldExecute} onChange={(e) => setShouldExecute(e.target.checked)} />}
          label="Execute Transaction"
        />
      </FormGroup>

      <div>Transaction id</div>
      <pre style={{ overflow: 'auto', width: '100%' }}>{txSummary.id}</pre>

      <div className={css.submit}>
        <Button variant="contained" onClick={handleSubmit}>
          Submit
        </Button>
      </div>
    </div>
  )
}

export default SignProposedTx
