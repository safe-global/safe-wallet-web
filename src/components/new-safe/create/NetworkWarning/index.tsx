import { Alert, AlertTitle, Box } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'
import ChainSwitcher from '@/components/common/ChainSwitcher'
import useIsWrongChain from '@/hooks/useIsWrongChain'

const NetworkWarning = ({ action }: { action?: string }) => {
  const chain = useCurrentChain()
  const isWrongChain = useIsWrongChain()

  if (!chain || !isWrongChain) return null

  return (
    <Alert severity="warning">
      <AlertTitle sx={{ fontWeight: 700 }}>Change your wallet network</AlertTitle>
      You are trying to {action || 'sign or execute a transaction'} on {chain.chainName}. Make sure that your wallet is
      set to the same network.
      <Box mt={2}>
        <ChainSwitcher />
      </Box>
    </Alert>
  )
}

export default NetworkWarning
