import { ReactElement } from 'react'
import { Button } from '@mui/material'
import { hexValue } from 'ethers/lib/utils'
import { useCurrentChain } from '@/hooks/useChains'
import useOnboard from '@/hooks/wallets/useOnboard'
import { useIsWrongChain } from '@/hooks/wallets/useWallet'

const ChainSwitcher = (): ReactElement | null => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  const isWrongChain = useIsWrongChain()

  const handleChainSwitch = () => {
    if (!chain) return
    const chainId = hexValue(parseInt(chain.chainId))
    onboard?.setChain({ chainId })
  }

  return isWrongChain ? (
    <Button onClick={handleChainSwitch} variant="outlined" color="secondary" size="small">
      Switch to {chain?.chainName}
    </Button>
  ) : null
}

export default ChainSwitcher
