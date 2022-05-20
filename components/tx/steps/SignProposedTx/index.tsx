import { ReactElement, useState } from 'react'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'

import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'
import { useChainId } from '@/services/useChainId'
import { dispatchTxExecution, dispatchTxProposal, dispatchTxSigning, prepareTx } from '@/services/txSender'
import useWallet from '@/services/wallets/useWallet'

const SignProposedTx = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const wallet = useWallet()
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)

  const onSign = async () => {
    if (!wallet) return

    try {
      const safeTx = await prepareTx(chainId, safeAddress, txSummary)
      const signedTx = await dispatchTxSigning(safeTx, txSummary.id)
      await dispatchTxProposal(chainId, safeAddress, wallet.address, signedTx)
    } catch (err) {
      // do something
    }
  }

  const onExecute = async () => {
    if (!wallet) return

    setIsSubmittable(false)
    try {
      const safeTx = await prepareTx(chainId, safeAddress, txSummary)
      await dispatchTxExecution(safeTx, txSummary.id)
    } catch {
      setIsSubmittable(true)
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
        <Button variant="contained" onClick={handleSubmit} disabled={!isSubmittable}>
          Submit
        </Button>
      </div>
    </div>
  )
}

export default SignProposedTx
