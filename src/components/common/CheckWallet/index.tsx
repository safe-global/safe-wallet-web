import { useState, type ReactElement } from 'react'
import { Button, CircularProgress, Tooltip } from '@mui/material'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useWallet from '@/hooks/wallets/useWallet'
import useConnectWallet from '../ConnectWallet/useConnectWallet'
import { useCurrentChain } from '@/hooks/useChains'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { switchWalletChain } from '@/services/tx/tx-sender/sdk'
import useOnboard from '@/hooks/wallets/useOnboard'
import type { OnboardAPI } from '@web3-onboard/core'
import ChainSwitcher from '../ChainSwitcher'

type CheckWalletProps = {
  children: (ok: boolean) => ReactElement
  allowSpendingLimit?: boolean
  allowNonOwner?: boolean
  noTooltip?: boolean
  checkNetwork?: boolean
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
  checkNetwork = false,
}: CheckWalletProps): ReactElement => {
  const wallet = useWallet()
  const isSafeOwner = useIsSafeOwner()
  const isSpendingLimit = useIsOnlySpendingLimitBeneficiary()
  const connectWallet = useConnectWallet()
  const chain = useCurrentChain()
  const isWrongChain = useIsWrongChain()
  const onboard = useOnboard()
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)

  const handleNetworkChange = async (onboard: OnboardAPI | undefined, chainId: string | undefined) => {
    if (!onboard || !chainId) return null
    setIsSubmittable(false)
    try {
      await switchWalletChain(onboard, chainId)
    } catch (error) {
      console.log(error)
    }
    setIsSubmittable(true)
  }

  if (checkNetwork && isWrongChain) {
    return <ChainSwitcher size="medium" contained />
    return (
      <Button
        variant="contained"
        sx={{ minWidth: '170px' }}
        onClick={() => handleNetworkChange(onboard, chain?.chainId)}
        disabled={!isSubmittable}
      >
        {!isSubmittable ? <CircularProgress size={20} /> : 'Switch Network'}
      </Button>
    )
  }

  const message =
    wallet && (isSafeOwner || allowNonOwner || (isSpendingLimit && allowSpendingLimit))
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
