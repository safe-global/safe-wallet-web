import { useSwitchNetwork } from '@web3modal/ethers/react'
import type { ReactElement } from 'react'
import { useCallback } from 'react'
import { Box, Button } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import css from './styles.module.css'

const ChainSwitcher = ({ fullWidth }: { fullWidth?: boolean }): ReactElement | null => {
  const chain = useCurrentChain()
  const isWrongChain = useIsWrongChain()
  const { switchNetwork } = useSwitchNetwork()

  const handleChainSwitch = useCallback(async () => {
    if (!chain) return

    try {
      await switchNetwork(Number(chain.chainId))
    } catch (e) {
      console.log(e)
    }
  }, [chain, switchNetwork])

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
