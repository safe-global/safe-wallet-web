import { Box } from '@mui/material'
import { useIsMultichainSafe } from '../../hooks/useIsMultichainSafe'
import ErrorMessage from '@/components/tx/ErrorMessage'

export const ChangeOwnerSetupWarning = () => {
  const isMultichainSafe = useIsMultichainSafe()

  if (!isMultichainSafe) return

  return (
    <Box mt={1} mb={1}>
      <ErrorMessage level="warning">
        Owners are not consistent across networks on this account. Changing owners will only affect the account on the
        selected network.
      </ErrorMessage>
    </Box>
  )
}
