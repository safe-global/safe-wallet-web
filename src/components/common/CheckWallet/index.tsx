import type { SyntheticEvent } from 'react'
import { useCallback, type ReactElement } from 'react'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useWallet from '@/hooks/wallets/useWallet'
import { Tooltip } from '@mui/material'
import { hexValue } from 'ethers/lib/utils'
import useOnboard from '@/hooks/wallets/useOnboard'
import useChainId from '@/hooks/useChainId'

type CheckWalletProps = {
  children: (ok: boolean) => ReactElement
  allowSpendingLimit?: boolean
  allowNonOwner?: boolean
}

enum Message {
  WalletNotConnected = 'Please connect your wallet',
  NotSafeOwner = "Your connected wallet isn't a Safe owner",
  OnlySpendingLimitBeneficiary = 'You can only create ERC-20 transactions within your spending limit',
}

const ChainSwitch = ({ children }: { children: ReactElement }): ReactElement => {
  const currentChainId = useChainId()
  const chainId = hexValue(parseInt(currentChainId))
  const onboard = useOnboard()

  const onClick = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault()
      e.stopPropagation()

      onboard?.setChain({ chainId })
    },
    [chainId, onboard],
  )

  return <span onClick={onClick}>{children}</span>
}

const CheckWallet = ({ children, allowSpendingLimit, allowNonOwner }: CheckWalletProps): ReactElement => {
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const isSafeOwner = useIsSafeOwner()
  const isSpendingLimit = useIsOnlySpendingLimitBeneficiary()

  const message = !wallet
    ? Message.WalletNotConnected
    : !isSafeOwner && !isSpendingLimit && !allowNonOwner
    ? Message.NotSafeOwner
    : isSpendingLimit && !allowSpendingLimit
    ? Message.OnlySpendingLimitBeneficiary
    : ''

  if (isWrongChain && !message) {
    return <ChainSwitch>{children(true)}</ChainSwitch>
  }

  if (!message) return children(true)

  return (
    <Tooltip title={message}>
      <span>{children(false)}</span>
    </Tooltip>
  )
}

export default CheckWallet
