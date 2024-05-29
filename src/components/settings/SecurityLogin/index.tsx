import { Box } from '@mui/material'
import dynamic from 'next/dynamic'
import { useIsRecoverySupported } from '@/features/recovery/hooks/useIsRecoverySupported'
import SecuritySettings from '../SecuritySettings'

const RecoverySettings = dynamic(() => import('@/features/recovery/components/RecoverySettings'))

const SecurityLogin = () => {
  const isRecoverySupported = useIsRecoverySupported()

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      {isRecoverySupported && <RecoverySettings />}

      <SecuritySettings />
    </Box>
  )
}

export default SecurityLogin
