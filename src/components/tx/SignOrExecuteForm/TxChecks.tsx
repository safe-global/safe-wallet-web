import { type ReactElement, useContext } from 'react'
import { TxSimulation, TxSimulationMessage } from '@/components/tx/security/tenderly'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Box, Typography } from '@mui/material'
import { Redefine, RedefineMessage } from '@/components/tx/security/redefine'

import css from './styles.module.css'

const TxChecks = ({ executionOwner }: { executionOwner?: string }): ReactElement => {
  const { safeTx } = useContext(SafeTxContext)

  return (
    <>
      <Typography variant="h5">Transaction checks</Typography>

      <TxSimulation disabled={false} transactions={safeTx} executionOwner={executionOwner} />

      <Box className={css.mobileTxCheckMessages}>
        <TxSimulationMessage />
      </Box>

      <Redefine />

      <Box className={css.mobileTxCheckMessages}>
        <RedefineMessage />
      </Box>
    </>
  )
}

export default TxChecks
