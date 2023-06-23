import { type ReactElement, useContext } from 'react'
import { TxSimulation } from '../NewTxSimulation'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Typography } from '@mui/material'

const TxChecks = (): ReactElement => {
  const { safeTx } = useContext(SafeTxContext)

  return (
    <>
      <Typography variant="h5">Transaction checks</Typography>

      <TxSimulation disabled={false} transactions={safeTx} />
    </>
  )
}

export default TxChecks
