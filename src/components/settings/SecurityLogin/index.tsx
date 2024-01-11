import { Box } from '@mui/material'
import SpendingLimits from '../SpendingLimits'
import dynamic from 'next/dynamic'
import { useIsRecoverySupported } from '@/features/recovery/hooks/useIsRecoverySupported'

const RecoverySettings = dynamic(() => import('@/features/recovery/components/RecoverySettings'))

const SecurityLogin = () => {
  const isRecoverySupported = useIsRecoverySupported()

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {isRecoverySupported && <RecoverySettings />}

      <SpendingLimits />
    </Box>
  )
}

export default SecurityLogin
