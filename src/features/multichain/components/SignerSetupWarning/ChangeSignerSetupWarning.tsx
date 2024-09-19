import { Box } from '@mui/material'
import { useIsMultichainSafe } from '../../hooks/useIsMultichainSafe'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { useCurrentChain } from '@/hooks/useChains'

export const ChangeSignerSetupWarning = () => {
  const isMultichainSafe = useIsMultichainSafe()
  const currentChain = useCurrentChain()

  if (!isMultichainSafe) return

  return (
    <Box mt={1} mb={1}>
      <ErrorMessage level="warning">
        {`Signers are not consistent across networks on this account. Changing signers will only affect the account on ${currentChain}`}
      </ErrorMessage>
    </Box>
  )
}
