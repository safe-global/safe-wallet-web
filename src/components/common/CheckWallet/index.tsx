import { type ReactElement } from 'react'
import { Tooltip } from '@mui/material'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useWallet from '@/hooks/wallets/useWallet'
import useConnectWallet from '../ConnectWallet/useConnectWallet'
import { useIsGnosisPayOwner } from '@/features/gnosispay/hooks/useIsGnosisPayOwner'

type CheckWalletProps = {
  children: (ok: boolean) => ReactElement
  allowSpendingLimit?: boolean
  allowNonOwner?: boolean
  allowGnosisPayOwner?: boolean
  noTooltip?: boolean
}

enum Message {
  WalletNotConnected = 'Please connect your wallet',
  NotSafeOwner = 'Your connected wallet is not a signer of this Safe Account',
}

const CheckWallet = ({
  children,
  allowSpendingLimit,
  allowNonOwner,
  noTooltip,
  allowGnosisPayOwner,
}: CheckWalletProps): ReactElement => {
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()
  const isSpendingLimit = useIsOnlySpendingLimitBeneficiary()
  const [isGnosisPayOwner] = useIsGnosisPayOwner()
  const connectWallet = useConnectWallet()

  const message =
    wallet &&
    (isSafeOwner ||
      allowNonOwner ||
      (isSpendingLimit && allowSpendingLimit) ||
      (allowGnosisPayOwner && Boolean(isGnosisPayOwner)))
      ? ''
      : !wallet
      ? Message.WalletNotConnected
      : Message.NotSafeOwner

  if (!message) return children(true)

  if (noTooltip) return children(false)

  return (
    <Tooltip title={message}>
      <span onClick={wallet ? undefined : connectWallet}>{children(false)}</span>
    </Tooltip>
  )
}

export default CheckWallet
