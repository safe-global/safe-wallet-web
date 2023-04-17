import { Box, Stack, Typography } from '@mui/material'
import { SafeMessageStatus, type SafeMessage } from '@safe-global/safe-gateway-typescript-sdk'
import EthHashInfo from '@/components/common/EthHashInfo'

const Confirmations = ({ message, threshold }: { message?: Omit<SafeMessage, 'type'>; threshold: number }) => {
  if (!message) return null

  return (
    <Box
      mt={2}
      borderRadius={1}
      padding={1}
      border={'1px solid'}
      borderColor={message?.status === SafeMessageStatus.NEEDS_CONFIRMATION ? 'red' : 'green'}
    >
      <Typography fontWeight={700} mb={1}>
        Confirmations{' '}
        <Typography component="span" sx={{ color: ({ palette }) => palette.border.main }}>
          ({`${message?.confirmationsSubmitted || 0} of ${threshold}`})
        </Typography>
      </Typography>
      <Stack direction="column" spacing={2}>
        {message?.confirmations?.map(({ owner }) => (
          <EthHashInfo address={owner.value} name={owner.name} key={owner.value} />
        ))}
      </Stack>
    </Box>
  )
}

export default Confirmations
