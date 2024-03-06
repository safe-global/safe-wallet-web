import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Redefine, RedefineMessage } from '@/components/tx/security/redefine'
import { TxSimulation, TxSimulationMessage } from '@/components/tx/security/tenderly'
import { Box, Typography } from '@mui/material'
import { useContext, type ReactElement } from 'react'

import css from './styles.module.css'

const TxChecks = ({ executionOwner }: { executionOwner?: string }): ReactElement => {
  const { safeTx } = useContext(SafeTxContext)

  return (
    <>
      <Typography variant="h5">Transaction checks</Typography>

      <TxSimulation disabled={false} transactions={safeTx} executionOwner={executionOwner} />

      <Box data-sid="30506" className={css.mobileTxCheckMessages}>
        <TxSimulationMessage />
      </Box>

      <Redefine />

      <Box data-sid="38979" className={css.mobileTxCheckMessages}>
        <RedefineMessage />
      </Box>
    </>
  )
}

export default TxChecks
