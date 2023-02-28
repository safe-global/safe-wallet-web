import { useCurrentChain } from '@/hooks/useChains'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useWallet from '@/hooks/wallets/useWallet'
import { Tooltip } from '@mui/material'
import { type ReactElement } from 'react'

type CheckWalletProps = {
  children: (ok: boolean) => ReactElement
  allowSpendingLimit?: boolean
  allowNonOwner?: boolean
}

enum Message {
  WalletNotConnected = 'Please connect your wallet',
  NotSafeOwner = "Your connected wallet isn't a Safe owner",
  OnlySpendingLimitBeneficiary = 'You can only create ERC20 transactions within the spending limit',
  WrongChain = 'Please switch your wallet to ',
}

const CheckWallet = ({ children, allowSpendingLimit, allowNonOwner }: CheckWalletProps): ReactElement => {
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const isSafeOwner = useIsSafeOwner()
  const isSpendingLimit = useIsOnlySpendingLimitBeneficiary()
  const currentChain = useCurrentChain()

  const message = !wallet
    ? Message.WalletNotConnected
    : isWrongChain
    ? Message.WrongChain + (currentChain?.chainName || 'the correct chain')
    : !isSafeOwner && !isSpendingLimit && !allowNonOwner
    ? Message.NotSafeOwner
    : isSpendingLimit && !allowSpendingLimit
    ? Message.OnlySpendingLimitBeneficiary
    : ''

  return message ? (
    <Tooltip title={message}>
      <span>{children(false)}</span>
    </Tooltip>
  ) : (
    <>{children(true)}</>
  )
}

export default CheckWallet
