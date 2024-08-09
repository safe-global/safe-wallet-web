import { type ReactElement } from 'react'
import { Tooltip } from '@mui/material'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useWallet from '@/hooks/wallets/useWallet'
import useConnectWallet from '../ConnectWallet/useConnectWallet'
import useSafeInfo from '@/hooks/useSafeInfo'

type CheckWalletProps = {
  children: (ok: boolean) => ReactElement
  allowSpendingLimit?: boolean
  allowNonOwner?: boolean
  noTooltip?: boolean
}

enum Message {
  WalletNotConnected = 'Please connect your wallet',
  NotSafeOwner = 'Your connected wallet is not a signer of this Safe Account',
  CounterfactualMultisig = 'You need to activate the Safe before transacting',
}

const CheckWallet = ({ children, allowSpendingLimit, allowNonOwner, noTooltip }: CheckWalletProps): ReactElement => {
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()
  const isSpendingLimit = useIsOnlySpendingLimitBeneficiary()
  const connectWallet = useConnectWallet()

  const { safe } = useSafeInfo()
  const isCounterfactualMultiSig = !allowNonOwner && !safe.deployed && safe.threshold > 1

  const message =
    wallet && (isSafeOwner || allowNonOwner || (isSpendingLimit && allowSpendingLimit)) && !isCounterfactualMultiSig
      ? ''
      : !wallet
      ? Message.WalletNotConnected
      : isCounterfactualMultiSig
      ? Message.CounterfactualMultisig
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
