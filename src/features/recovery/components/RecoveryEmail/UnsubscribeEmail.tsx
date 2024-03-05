import { Box, Button, Card, Typography } from '@mui/material'
import SafeLogo from '@/public/images/logo-text.svg'
import Stack from '@mui/material/Stack'
import { useSearchParams } from 'next/navigation'

const UnsubscribeEmail = () => {
  const query = useSearchParams()
  const token = query.get('token')
  const category = query.get('category')

  const handleUnsubscribe = () => {
    if (!token || !category) return // Better display an error

    // TODO: Implement once the SDK is ready
  }

  const handleCancel = () => {
    // TODO: Show a specific message
  }

  return (
    <Box maxWidth={600} mx="auto">
      <SafeLogo />
      <Card sx={{ p: 4, mt: 3 }}>
        <Stack gap={3}>
          <Typography variant="h1" fontWeight="bold">
            Confirm unsubscription from recovery updates
          </Typography>
          <Typography>
            Are you sure you would like to unsubscribe from the mailing list for the account recovery? Unsubscribing
            will mean that you won&apos;t receive any more emails for recovery attempts.
          </Typography>
          <Stack direction="row" gap={2} flexWrap="wrap">
            <Button variant="contained">Yes, unsubscribe</Button>
            <Button variant="outlined">Keep me subscribed</Button>
          </Stack>
        </Stack>
      </Card>
      <Typography mt={3}>© 2024 Core Contributors GmbH</Typography>
    </Box>
  )
}

export default UnsubscribeEmail
