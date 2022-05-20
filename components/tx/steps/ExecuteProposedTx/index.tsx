import { ReactElement, useState } from 'react'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Typography } from '@mui/material'

import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'
import { useChainId } from '@/services/useChainId'
import { dispatchTxExecution } from '@/services/txSender'

const ExecuteProposedTx = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const address = useSafeAddress()
  const chainId = useChainId()
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)

  const onExecute = async () => {
    setIsSubmittable(false)
    try {
      await dispatchTxExecution(chainId, address, txSummary)
    } catch {
      setIsSubmittable(true)
    }
  }

  return (
    <div className={css.container}>
      <Typography variant="h6">Execute transaction</Typography>

      <div>Transaction id</div>
      <pre style={{ overflow: 'auto', width: '100%' }}>{txSummary.id}</pre>

      <div className={css.submit}>
        <Button variant="contained" onClick={onExecute} disabled={isSubmittable}>
          Submit
        </Button>
      </div>
    </div>
  )
}

export default ExecuteProposedTx
