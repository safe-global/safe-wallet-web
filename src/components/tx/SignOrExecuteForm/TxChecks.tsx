import { type ReactElement, useContext } from 'react'
import { TxSimulation } from '../NewTxSimulation'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Typography } from '@mui/material'
import { RedefineScanResult } from '@/components/tx/security/redefine/RedefineScanResult/RedefineScanResult'

const TxChecks = (): ReactElement => {
  const { safeTx } = useContext(SafeTxContext)

  return (
    <>
      <Typography variant="h5">Transaction checks</Typography>

      <TxSimulation disabled={false} transactions={safeTx} />

      <RedefineScanResult />
    </>
  )
}

export default TxChecks
