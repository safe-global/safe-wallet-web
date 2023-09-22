import { Button } from '@mui/material'
import { Operation } from '@safe-global/safe-gateway-typescript-sdk'
import type { Delay } from '@gnosis.pm/zodiac'
import type { ReactElement } from 'react'

import useWallet from '@/hooks/wallets/useWallet'
import { getSafeContractDeployment } from '@/services/contracts/deployments'
import { useCurrentChain } from '@/hooks/useChains'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Interface } from 'ethers/lib/utils'
import { useWeb3 } from '@/hooks/wallets/web3'

const NEW_THRESHOLD = 1

export function RecoveryProposal({ delayModifier }: { delayModifier: Delay }): ReactElement {
  const chain = useCurrentChain()
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const web3 = useWeb3()

  const onPropose = async () => {
    if (!chain || !wallet || !web3) {
      return
    }

    const safeDeployment = getSafeContractDeployment(chain, safe.version)
    const safeInterface = new Interface(safeDeployment?.abi ?? [])

    const addOwnerWithThresholdData = safeInterface.encodeFunctionData('addOwnerWithThreshold', [
      wallet.address,
      NEW_THRESHOLD,
    ])

    const signer = web3.getSigner()

    await delayModifier
      .connect(signer)
      .execTransactionFromModule(safeAddress, '0', addOwnerWithThresholdData, Operation.CALL)
  }

  return (
    <Button variant="contained" onClick={onPropose}>
      Propose recovery
    </Button>
  )
}
