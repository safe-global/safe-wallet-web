import { Paper } from '@mui/material'
import type { ReactElement } from 'react'

import { useDelayModifier } from './useDelayModifier'
import { RecoverersList } from './RecoverersList'
import { RecoverySetup } from './RecoverySetup'
import useAsync from '@/hooks/useAsync'
import { MODULE_PAGE_SIZE } from '@/services/recovery/delay-modifier'
import { SENTINEL_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import useWallet from '@/hooks/wallets/useWallet'
import { RecoveryProposal } from './RecoveryProposal'
import { RecoveryProposals } from './RecoveryProposals'

export function Recovery(): ReactElement {
  const wallet = useWallet()
  const [delayModifier] = useDelayModifier()

  const [recoverers] = useAsync<Array<string> | undefined>(async () => {
    if (!delayModifier) {
      return
    }

    const [modules] = await delayModifier.getModulesPaginated(SENTINEL_ADDRESS, MODULE_PAGE_SIZE)
    return modules
  }, [delayModifier])

  const isRecoverer = !!wallet && recoverers?.includes(wallet.address)

  return (
    <Paper sx={{ p: 4 }}>
      {delayModifier ? (
        isRecoverer ? (
          <RecoveryProposal delayModifier={delayModifier} />
        ) : (
          <>
            <RecoverersList delayModifier={delayModifier} recoverers={recoverers ?? []} />
            <RecoveryProposals delayModifier={delayModifier} />
          </>
        )
      ) : (
        <RecoverySetup />
      )}
    </Paper>
  )
}
