import { ReactElement, useState } from 'react'
import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { getTransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'

import ErrorToast from '@/components/common/ErrorToast'
import { createTransaction, executeTransaction, signTransaction } from '@/services/createTransaction'
import extractTxInfo from '@/services/extractTxInfo'
import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'
import { executeTx } from '@/components/tx/ExecuteProposedTx'
import { showNotification } from '@/store/notificationsSlice'
import { useAppDispatch } from '@/store'

const getTxDetails = async (chainId: string, id: string) => {
  return getTransactionDetails(chainId, id)
}

const SignProposedTx = ({
  txSummary,
  onSubmit,
}: {
  txSummary: TransactionSummary
  onSubmit: (tx: SafeTransaction) => void
}): ReactElement => {
  const { chainId } = useSafeAddress()
  const dispatch = useAppDispatch()
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)

  const onSign = async () => {
    try {
      const txDetails = await getTxDetails(chainId, txSummary.id)
      const { txParams, signatures } = extractTxInfo(txSummary, txDetails)

      const safeTx = await createTransaction(txParams)
      Object.entries(signatures).forEach(([signer, data]) => {
        safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
      })

      const signedTx = await signTransaction(safeTx)
      onSubmit(signedTx)
    } catch (err) {
      dispatch(showNotification({ message: (err as Error).message }))
    }
  }

  const onExecute = async () => {
    try {
      await executeTx(chainId, txSummary)
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
