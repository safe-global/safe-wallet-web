import { Alert, AlertTitle } from '@mui/material'
import { useCurrentChain } from '@/hooks/useChains'

const NetworkWarning = () => {
  const chain = useCurrentChain()

  if (!chain) return null

  return (
    <Alert severity="info" sx={{ mt: 3 }}>
      <AlertTitle sx={{ fontWeight: 700 }}>Change your wallet network</AlertTitle>
      You are trying to create a Safe on {chain.chainName}. Make sure that your wallet is set to the same network.
    </Alert>
  )
}

export default NetworkWarning
