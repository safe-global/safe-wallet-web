import { Alert } from '@mui/material'
import { useIsMultichainSafe } from '../../hooks/useIsMultichainSafe'
import { useCurrentChain } from '@/hooks/useChains'

export const ChangeSignerSetupWarning = () => {
  const isMultichainSafe = useIsMultichainSafe()
  const currentChain = useCurrentChain()

  if (!isMultichainSafe) return

  return (
    <Alert severity="info" sx={{ border: 'none', mt: 0, mb: 0 }}>
      {`Signers are not consistent across networks on this account. Changing signers will only affect the account on ${currentChain?.chainName}`}
    </Alert>
  )
}
