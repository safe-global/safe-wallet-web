import { ReactElement } from 'react'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Button, Typography } from '@mui/material'

import useSafeAddress from '@/services/useSafeAddress'
import css from './styles.module.css'
import { useAppDispatch } from '@/store'
import { useChainId } from '@/services/useChainId'
import { dispatchTxExecution } from '@/services/txSender'

const ExecuteProposedTx = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const address = useSafeAddress()
  const chainId = useChainId()
  const dispatch = useAppDispatch()

  const onExecute = () => {
    dispatch(dispatchTxExecution(chainId, address, txSummary))
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
