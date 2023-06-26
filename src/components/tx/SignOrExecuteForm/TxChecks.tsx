import { type ReactElement, useContext } from 'react'
import { TxSimulation } from '@/components/tx/security/tenderly'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Typography } from '@mui/material'
import { Redefine } from '@/components/tx/security/redefine'

const TxChecks = (): ReactElement => {
  const { safeTx } = useContext(SafeTxContext)

  return (
    <>
      <Typography variant="h5">Transaction checks</Typography>

      <Redefine />

      <TxSimulation disabled={false} transactions={safeTx} />
    </>
  )
}

export default TxChecks
