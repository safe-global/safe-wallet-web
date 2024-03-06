import { useCurrentChain } from '@/hooks/useChains'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useOnboard from '@/hooks/wallets/useOnboard'
import { switchWalletChain } from '@/services/tx/tx-sender/sdk'
import { Box, Button } from '@mui/material'
import type { ReactElement } from 'react'
import { useCallback } from 'react'
import css from './styles.module.css'

const ChainSwitcher = ({ fullWidth }: { fullWidth?: boolean }): ReactElement | null => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  const isWrongChain = useIsWrongChain()

  const handleChainSwitch = useCallback(async () => {
    if (!onboard || !chain) return

    await switchWalletChain(onboard, chain.chainId)
  }, [chain, onboard])

  if (!isWrongChain) return null

  return (
    <Button
      data-sid="66774"
      onClick={handleChainSwitch}
      variant="outlined"
      size="small"
      fullWidth={fullWidth}
      color="primary"
    >
      Switch to&nbsp;
      <Box data-sid="93190" className={css.circle} bgcolor={chain?.theme?.backgroundColor || ''} />
      &nbsp;{chain?.chainName}
    </Button>
  )
}

export default ChainSwitcher
