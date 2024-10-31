import { type ReactElement, useContext } from 'react'
import { SafenetTxSimulation } from '@/components/tx/security/safenet'
import TxCard from '@/components/tx-flow/common/TxCard'
import { SafeTxContext } from '@/components/tx-flow/SafeTxProvider'
import useIsSafenetEnabled from '@/hooks/useIsSafenetEnabled'
import { Typography } from '@mui/material'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import { SafeTransaction } from '@safe-global/safe-core-sdk-types'

const SafenetTxChecks = ({ safeTx }: { safeTx?: SafeTransaction }): ReactElement | null => {
  const safe = useSafeAddress()
  const chainId = useChainId()
  const isSafenetEnabled = useIsSafenetEnabled()

  if (!isSafenetEnabled) {
    return null
  }

  return (
    <TxCard>
      <Typography variant="h5">Safenet checks</Typography>

      <SafenetTxSimulation safe={safe} chainId={chainId} safeTx={safeTx} />
    </TxCard>
  )
}

export default SafenetTxChecks
