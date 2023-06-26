import { type ReactElement, useContext } from 'react'
import { TxSimulation } from '../NewTxSimulation'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Typography } from '@mui/material'
import { NewRedefine } from '@/components/tx/security/redefine/NewRedefineScanResult/RedefineScanResult'

const TxChecks = (): ReactElement => {
  const { safeTx } = useContext(SafeTxContext)

  return (
    <>
      <Typography variant="h5">Transaction checks</Typography>

      <TxSimulation disabled={false} transactions={safeTx} />

      <NewRedefine />
    </>
  )
}

export default TxChecks
