import type { ReactElement } from 'react'
import { Typography } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import ErrorMessage from '@/components/tx/ErrorMessage'

export const WrongChainWarning = (): ReactElement | null => {
  const chain = useCurrentChain()
  const isWrongChain = useIsWrongChain()

  if (!isWrongChain || !chain) {
    return null
  }

  return (
    <ErrorMessage level="info">
      <Typography fontWeight="bold">Wallet network switch</Typography>
      When you submit the transaction, you will be asked to switch your wallet network to {chain.chainName}.
    </ErrorMessage>
  )
}
