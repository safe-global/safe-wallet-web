import type { ReactElement } from 'react'
import { Box } from '@mui/material'

import { useCurrentChain } from '@/hooks/useChains'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import ErrorMessage from '@/components/tx/ErrorMessage'

import css from './styles.module.css'
import ChainSwitcher from '@/components/common/ChainSwitcher'

export const WrongChainWarning = (): ReactElement | null => {
  const chain = useCurrentChain()
  const isWrongChain = useIsWrongChain()

  if (!isWrongChain || !chain) {
    return null
  }

  return (
    <ErrorMessage className={css.container}>
      Your wallet is connected to the wrong chain. When you submit, you will first be asked to connect to{' '}
      {chain.chainName}.
      <Box mt={1.5} textAlign="center">
        <ChainSwitcher />
      </Box>
    </ErrorMessage>
  )
}
