import type { ReactElement } from 'react'
import { useCallback } from 'react'
import { Box, Button } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'
import useOnboard from '@/hooks/wallets/useOnboard'
import css from './styles.module.css'
import { switchWalletChain } from '@/services/tx/tx-sender/sdk'

const ChainSwitcher = ({ fullWidth }: { fullWidth?: boolean }): ReactElement | null => {
  const chain = useCurrentChain()
  const onboard = useOnboard()

  const handleChainSwitch = useCallback(() => {
    if (!chain || !onboard) return

    void switchWalletChain(onboard, chain.chainId)
  }, [onboard, chain])

  return (
    <Button onClick={handleChainSwitch} variant="outlined" size="small" fullWidth={fullWidth} color="primary">
      Switch to&nbsp;
      <Box className={css.circle} bgcolor={chain?.theme?.backgroundColor || ''} />
      &nbsp;{chain?.chainName}
    </Button>
  )
}

export default ChainSwitcher
