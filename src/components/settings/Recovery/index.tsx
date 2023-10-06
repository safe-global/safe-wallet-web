import { Paper } from '@mui/material'
import type { ReactElement } from 'react'

import { RecoverersList } from './RecoverersList'
import { RecoverySetup } from './RecoverySetup'
import { getModuleInstance, KnownContracts } from '@gnosis.pm/zodiac'
import useWallet from '@/hooks/wallets/useWallet'
import { RecoveryProposal } from './RecoveryProposal'
import { RecoveryProposals } from './RecoveryProposals'
import { useAppSelector } from '@/store'
import { selectRecovery } from '@/store/recoverySlice'
import { useWeb3 } from '@/hooks/wallets/web3'

export function Recovery(): ReactElement {
  const wallet = useWallet()
  const recovery = useAppSelector(selectRecovery)
  const web3 = useWeb3()

  if (!recovery || !web3) {
    return (
      <Paper sx={{ p: 4 }}>
        <RecoverySetup />
      </Paper>
    )
  }

  const isRecoverer = !!wallet && recovery.modules.includes(wallet.address)
  const delayModifier = getModuleInstance(KnownContracts.DELAY, recovery.address, web3)

  return (
    <Paper sx={{ p: 4 }}>
      {isRecoverer ? (
        <RecoveryProposal delayModifier={delayModifier} />
      ) : (
        <RecoverersList delayModifier={delayModifier} recoverers={recovery.modules} />
      )}
      <RecoveryProposals delayModifier={delayModifier} isRecoverer={isRecoverer} />
    </Paper>
  )
}
