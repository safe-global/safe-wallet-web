import { PendingSafeStatus, selectUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { useAppSelector } from '@/store'
import { Tooltip } from '@mui/material'
import { type ReactElement } from 'react'
import useConnectWallet from '../ConnectWallet/useConnectWallet'

type CheckWalletProps = {
  children: (ok: boolean) => ReactElement
  allowSpendingLimit?: boolean
  allowNonOwner?: boolean
  noTooltip?: boolean
}

enum Message {
  WalletNotConnected = 'Please connect your wallet',
  NotSafeOwner = 'Your connected wallet is not a signer of this Safe Account',
  SafeDeploymentInProgress = 'Safe Account is being activated',
  SafeNotActivated = 'Activate the Safe first',
}

const CheckWallet = ({ children, allowSpendingLimit, allowNonOwner, noTooltip }: CheckWalletProps): ReactElement => {
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()
  const isSpendingLimit = useIsOnlySpendingLimitBeneficiary()
  const connectWallet = useConnectWallet()
  const { safeAddress, safe } = useSafeInfo()
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, safe.chainId, safeAddress))

  const message = !wallet
    ? Message.WalletNotConnected
    : (!isSafeOwner && !isSpendingLimit && !allowNonOwner) || (isSpendingLimit && !allowSpendingLimit && !allowNonOwner)
    ? Message.NotSafeOwner
    : !!undeployedSafe && undeployedSafe.status.status !== PendingSafeStatus.AWAITING_EXECUTION
    ? Message.SafeDeploymentInProgress
    : !!undeployedSafe && undeployedSafe.props.safeAccountConfig.threshold > 1
    ? Message.SafeNotActivated
    : ''

  if (!message) return children(true)

  if (noTooltip) return children(false)

  return (
    <Tooltip title={message}>
      <span onClick={wallet ? undefined : connectWallet}>{children(false)}</span>
    </Tooltip>
  )
}

export default CheckWallet
