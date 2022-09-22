import { ReactElement, useCallback } from 'react'
import { Box, Button } from '@mui/material'
import { hexValue } from 'ethers/lib/utils'
import { useCurrentChain } from '@/hooks/useChains'
import useOnboard from '@/hooks/wallets/useOnboard'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import css from './styles.module.css'

const ChainSwitcher = ({ fullWidth }: { fullWidth?: boolean }): ReactElement | null => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  const isWrongChain = useIsWrongChain()

  const handleChainSwitch = useCallback(() => {
    if (!chain) return
    const chainId = hexValue(parseInt(chain.chainId))
    onboard?.setChain({ chainId })
  }, [onboard, chain])

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
