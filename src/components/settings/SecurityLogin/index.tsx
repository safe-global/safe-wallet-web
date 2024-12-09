import { Stack } from '@mui/material'
import dynamic from 'next/dynamic'
import { useIsRecoverySupported } from '@/features/recovery/hooks/useIsRecoverySupported'
import SecuritySettings from '../SecuritySettings'
import { useRouter } from 'next/router'

const RecoverySettings = dynamic(() => import('@/features/recovery/components/RecoverySettings'))

const SecurityLogin = () => {
  const isRecoverySupported = useIsRecoverySupported()
  const router = useRouter()

  return (
    <Stack spacing={2}>
      {isRecoverySupported && router.query.safe ? <RecoverySettings /> : null}

      <SecuritySettings />
    </Stack>
  )
}

export default SecurityLogin
