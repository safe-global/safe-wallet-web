import { ReactElement, useState } from 'react'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Checkbox, FormControlLabel, FormGroup, Typography } from '@mui/material'

import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'
import { useChainId } from '@/services/useChainId'
import { createExistingTx, dispatchTxExecution, dispatchTxProposal, dispatchTxSigning } from '@/services/tx/txSender'
import useWallet from '@/services/wallets/useWallet'

type ReviewNewTxProps = {
  txSummary: TransactionSummary
  onSubmit: (data: null) => void
}

const SignProposedTx = ({ txSummary, onSubmit }: ReviewNewTxProps): ReactElement => {
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const wallet = useWallet()
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)

  const onFinish = async (actionFn: () => Promise<void>) => {
    if (!wallet) return
    setIsSubmittable(false)
    try {
      await actionFn()
    } catch (err) {
      setIsSubmittable(true)
      return
    }
    onSubmit(null)
  }

  const onSign = async () => {
    onFinish(async () => {
      const safeTx = await createExistingTx(chainId, safeAddress, txSummary)
      const signedTx = await dispatchTxSigning(safeTx, txSummary.id)
      await dispatchTxProposal(chainId, safeAddress, wallet!.address, signedTx)
    })
  }

  const onExecute = async () => {
    onFinish(async () => {
      const safeTx = await createExistingTx(chainId, safeAddress, txSummary)
      await dispatchTxExecution(safeTx, txSummary.id)
    })
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
