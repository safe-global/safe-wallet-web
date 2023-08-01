import type { ReactElement } from 'react'
import { useCallback } from 'react'
import { Box, Button } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import css from './styles.module.css'
import { switchWalletChain } from '@/services/tx/tx-sender/sdk'
import useWallet from '@/hooks/wallets/useWallet'
import { ethers } from 'ethers'

const ChainSwitcher = ({ fullWidth }: { fullWidth?: boolean }): ReactElement | null => {
  const chain = useCurrentChain()
  const [wallet] = useWallet()
  const isWrongChain = useIsWrongChain()

  const handleChainSwitch = useCallback(async () => {
    if (!wallet?.provider || !chain) return
    await switchWalletChain(new ethers.providers.Web3Provider(wallet.provider), chain.chainId)
  }, [chain, wallet])

  if (!isWrongChain) return null

  return (
    <Button onClick={handleChainSwitch} variant="outlined" size="small" fullWidth={fullWidth} color="primary">
      Switch to&nbsp;
      <Box className={css.circle} bgcolor={chain?.theme?.backgroundColor || ''} />
      &nbsp;{chain?.chainName}
    </Button>
  )
}

export default ChainSwitcher
