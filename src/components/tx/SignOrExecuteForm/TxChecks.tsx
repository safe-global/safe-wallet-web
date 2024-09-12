import { isTxSimulationEnabled } from '@/components/tx/security/tenderly/utils'
import { useCurrentChain, useHasFeature } from '@/hooks/useChains'
import { FEATURES } from '@/utils/chains'
import { type ReactElement, useContext } from 'react'
import { TxSimulation, TxSimulationMessage } from '@/components/tx/security/tenderly'
import TxCard from '@/components/tx-flow/common/TxCard'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import { Box, Typography } from '@mui/material'

import css from './styles.module.css'

const TxChecks = ({ executionOwner }: { executionOwner?: string }): ReactElement | null => {
  const { safeTx } = useContext(SafeTxContext)
  const chain = useCurrentChain()
  const isRiskMitigationFeatureEnabled = useHasFeature(FEATURES.RISK_MITIGATION)
  const isTxSimulationFeatureEnabled = isTxSimulationEnabled(chain)

  if (!isTxSimulationFeatureEnabled && !isRiskMitigationFeatureEnabled) {
    return null
  }

  return (
    <TxCard>
      <Typography variant="h5">Transaction checks</Typography>

      <TxSimulation disabled={false} transactions={safeTx} executionOwner={executionOwner} />

      <Box className={css.mobileTxCheckMessages}>
        <TxSimulationMessage />
      </Box>
    </TxCard>
  )
}

export default TxChecks
