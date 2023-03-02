import { type ReactElement } from 'react'
import { Tooltip } from '@mui/material'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useWallet from '@/hooks/wallets/useWallet'
import useConnectWallet from '../ConnectWallet/useConnectWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { useCurrentChain } from '@/hooks/useChains'

type CheckWalletProps = {
  children: (ok: boolean) => ReactElement
  allowSpendingLimit?: boolean
  allowNonOwner?: boolean
}

enum Message {
  WalletNotConnected = 'Please connect your wallet',
  WrongNetwork = 'Please connect your wallet to ',
  NotSafeOwner = "Your connected wallet isn't a Safe owner",
  OnlySpendingLimitBeneficiary = 'You can only create ERC-20 transactions within your spending limit',
}

const CheckWallet = ({ children, allowSpendingLimit, allowNonOwner }: CheckWalletProps): ReactElement => {
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const isSafeOwner = useIsSafeOwner()
  const isSpendingLimit = useIsOnlySpendingLimitBeneficiary()
  const connectWallet = useConnectWallet()
  const currentChain = useCurrentChain()

  const message = !wallet
    ? Message.WalletNotConnected
    : isWrongChain
    ? Message.WrongNetwork + (currentChain?.chainName || '')
    : !isSafeOwner && !isSpendingLimit && !allowNonOwner
    ? Message.NotSafeOwner
    : isSpendingLimit && !allowSpendingLimit
    ? Message.OnlySpendingLimitBeneficiary
    : ''

  if (!message) return children(true)

  return (
    <Tooltip title={message}>
      <span onClick={wallet ? undefined : connectWallet}>{children(false)}</span>
    </Tooltip>
  )
}

export default CheckWallet
