import ErrorMessage from '@/components/tx/ErrorMessage'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import useRecoveryEmail from '@/features/recovery/components/RecoveryEmail/useRecoveryEmail'
import { Box, Button, Card, Typography } from '@mui/material'
import SafeLogo from '@/public/images/logo-text.svg'
import Stack from '@mui/material/Stack'

const UnsubscribeEmail = () => {
  const [success, setSuccess] = useState<boolean>(false)
  const [error, setError] = useState<string>()
  const query = useSearchParams()
  const token = query.get('token')
  const category = query.get('category')
  const { unsubscribeFromSingleCategory } = useRecoveryEmail()

  const handleUnsubscribe = async () => {
    if (!token || !category) return

    try {
      await unsubscribeFromSingleCategory(token, category)
      setSuccess(true)
    } catch (e) {
      setError('Error unsubscribing from email notifications. Please try again.')
    }
  }

  return (
    <Box maxWidth={600} mx="auto">
      <SafeLogo />
      <Card sx={{ p: 4, mt: 3 }}>
        <Stack gap={3} alignItems="flex-start">
          <Typography variant="h1" fontWeight="bold">
            Unsubscribe from recovery updates
          </Typography>
          <Typography>
            {success
              ? 'You have successfully unsubscribed!'
              : 'Are you sure you want to unsubscribe from receiving email notifications for recovery proposals?'}
          </Typography>

          {!success && (
            <Button variant="contained" onClick={handleUnsubscribe}>
              Yes, unsubscribe
            </Button>
          )}

          {error && <ErrorMessage noMargin>{error}</ErrorMessage>}
        </Stack>
      </Card>
      <Typography mt={3}>© 2024 Core Contributors GmbH</Typography>
    </Box>
  )
}

export default UnsubscribeEmail
