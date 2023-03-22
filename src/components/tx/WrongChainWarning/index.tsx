import { Alert, Box, Button, SvgIcon } from '@mui/material'
import type { ReactElement } from 'react'

import { useCurrentChain } from '@/hooks/useChains'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useOnboard from '@/hooks/wallets/useOnboard'
import { switchWalletChain } from '@/services/tx/tx-sender/sdk'
import WarningIcon from '@/public/images/notifications/warning.svg'

import css from './styles.module.css'

export const WrongChainWarning = (): ReactElement | null => {
  const chain = useCurrentChain()
  const onboard = useOnboard()
  const isWrongChain = useIsWrongChain()

  if (!isWrongChain) {
    return null
  }

  const handleChainSwitch = async () => {
    if (!onboard || !chain) {
      return
    }

    await switchWalletChain(onboard, chain.chainId)
  }

  return (
    <Alert
      severity="error"
      icon={<SvgIcon component={WarningIcon} inheritViewBox fontSize="small" />}
      variant="filled"
      className={css.alert}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: 'auto' }}>
        Your wallet is connected to the wrong chain.
        <Button variant="outlined" onClick={handleChainSwitch}>
          Switch chain
        </Button>
      </Box>
    </Alert>
  )
}
