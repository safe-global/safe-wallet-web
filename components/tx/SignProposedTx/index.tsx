import { type SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'
import { getTransactionDetails, TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'
import ErrorToast from '@/components/common/ErrorToast'
import { ReactElement, useState } from 'react'
import { createTransaction, signTransaction, executeTransaction } from '@/services/createTransaction'
import extractTxInfo from '@/services/extractTxInfo'
import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'

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
  const [error, setError] = useState<Error>()
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)

  const onSign = async () => {
    console.log('onSign')
    try {
      const txDetails = await getTxDetails(chainId, txSummary.id)
      const { txParams, signatures } = extractTxInfo(txSummary, txDetails)

      const safeTx = await createTransaction(txParams)
      Object.entries(signatures).forEach(([signer, data]) => {
        safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
      })

      const signedTx = await signTransaction(safeTx)
      // await executeTransaction(safeTx)
      // onSubmit(signedTx)
    } catch (err) {
      setError(err as Error)
    }
  }

  const onSignAndExecute = async () => {
    console.log('onSignAndExecute')
    try {
      const txDetails = await getTxDetails(chainId, txSummary.id)
      const { txParams, signatures } = extractTxInfo(txSummary, txDetails)

      const safeTx = await createTransaction(txParams)
      Object.entries(signatures).forEach(([signer, data]) => {
        safeTx.addSignature({ signer, data, staticPart: () => data, dynamicPart: () => '' })
      })

      const signedTx = await signTransaction(safeTx)
      await executeTransaction(safeTx)
      // onSubmit(signedTx)
    } catch (err) {
      setError(err as Error)
    }
  }

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
        <Button variant="contained" onClick={shouldExecute ? onSignAndExecute : onSign}>
          Sign
        </Button>
      </div>

      {error && <ErrorToast message={error.message} />}
    </div>
  )
}

export default SignProposedTx
