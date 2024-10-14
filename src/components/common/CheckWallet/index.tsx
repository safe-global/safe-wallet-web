import { useIsWalletDelegate } from '@/hooks/useDelegates'
import { useMemo, type ReactElement } from 'react'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useWallet from '@/hooks/wallets/useWallet'
import useConnectWallet from '../ConnectWallet/useConnectWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { Tooltip } from '@mui/material'
import useSafeInfo from '@/hooks/useSafeInfo'

type CheckWalletProps = {
  children: (ok: boolean) => ReactElement
  allowSpendingLimit?: boolean
  allowNonOwner?: boolean
  noTooltip?: boolean
  checkNetwork?: boolean
  allowUndeployedSafe?: boolean
}

enum Message {
  WalletNotConnected = 'Please connect your wallet',
  NotSafeOwner = 'Your connected wallet is not a signer of this Safe Account',
  SafeNotActivated = 'You need to activate the Safe before transacting',
}

const CheckWallet = ({
  children,
  allowSpendingLimit,
  allowNonOwner,
  noTooltip,
  checkNetwork = false,
  allowUndeployedSafe = false,
}: CheckWalletProps): ReactElement => {
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()
  const isOnlySpendingLimit = useIsOnlySpendingLimitBeneficiary()
  const connectWallet = useConnectWallet()
  const isWrongChain = useIsWrongChain()
  const isDelegate = useIsWalletDelegate()

  const { safe } = useSafeInfo()

  const isUndeployedSafe = !safe.deployed

  const message = useMemo(() => {
    if (!wallet) {
      return Message.WalletNotConnected
    }
    if (isUndeployedSafe && !allowUndeployedSafe) {
      return Message.SafeNotActivated
    }

    if (!allowNonOwner && !isSafeOwner && !isDelegate && (!isOnlySpendingLimit || !allowSpendingLimit)) {
      return Message.NotSafeOwner
    }
  }, [
    allowNonOwner,
    allowSpendingLimit,
    allowUndeployedSafe,
    isDelegate,
    isOnlySpendingLimit,
    isSafeOwner,
    isUndeployedSafe,
    wallet,
  ])

  if (checkNetwork && isWrongChain) return children(false)
  if (!message) return children(true)
  if (noTooltip) return children(false)

  return (
    <Tooltip title={message}>
      <span onClick={wallet ? undefined : connectWallet}>{children(false)}</span>
    </Tooltip>
  )
}

export default CheckWallet
