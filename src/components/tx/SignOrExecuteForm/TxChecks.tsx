import { type ReactElement, useContext } from 'react'
import { TxSimulation } from '@/components/tx/security/tenderly'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Box, Typography } from '@mui/material'
import { Redefine, RedefineMessage } from '@/components/tx/security/redefine'

import css from './styles.module.css'

const TxChecks = (): ReactElement => {
  const { safeTx } = useContext(SafeTxContext)

  return (
    <>
      <Typography variant="h5">Transaction checks</Typography>

      <TxSimulation disabled={false} transactions={safeTx} />

      <Redefine />

      <Box className={css.mobileRedefineMessages}>
        <RedefineMessage />
      </Box>
    </>
  )
}

export default TxChecks
