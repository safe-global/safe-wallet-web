import { Box, Typography } from '@mui/material'
import LoadingSpinner, { SpinnerStatus } from '@/components/new-safe/create/steps/StatusStep/LoadingSpinner'

export enum TransactionStatus {
  PROCESSING,
}

const getStep = (status: TransactionStatus) => {
  switch (status) {
    case TransactionStatus.PROCESSING:
      return {
        description: 'Transaction is now processing.',
        instruction: 'The transaction was confirmed and is now being processed.',
      }
  }
}

const StatusMessage = ({ status, isError }: { status: TransactionStatus; isError: boolean }) => {
  const stepInfo = getStep(status)

  const color = isError ? 'error' : 'info'

  return (
    <>
      <Box paddingX={3} mt={3}>
        <LoadingSpinner status={SpinnerStatus.PROCESSING} />
        <Typography variant="h6" marginTop={2} fontWeight={700}>
          {stepInfo.description}
        </Typography>
      </Box>
      {stepInfo.instruction && (
        <Box
          sx={({ palette }) => ({
            backgroundColor: palette[color].background,
            borderColor: palette[color].light,
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: '6px',
          })}
          padding={3}
          mt={4}
          mb={0}
        >
          <Typography variant="body2">{stepInfo.instruction}</Typography>
        </Box>
      )}
    </>
  )
}

export default StatusMessage
