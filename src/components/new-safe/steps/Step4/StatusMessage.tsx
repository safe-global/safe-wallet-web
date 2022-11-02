import { Box, Typography } from '@mui/material'
import { SafeCreationStatus } from './useSafeCreation'
import LoadingSpinner from '@/components/new-safe/steps/Step4/LoadingSpinner'

const getStep = (status: SafeCreationStatus) => {
  switch (status) {
    case SafeCreationStatus.AWAITING:
      return {
        description: 'Step 1/2: Waiting for transaction confirmation.',
        instruction: 'Please confirm the transaction with your connected wallet.',
      }
    case SafeCreationStatus.WALLET_REJECTED:
      return {
        description: 'Transaction was rejected.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.PROCESSING:
      return {
        description: 'Step 2/2: Transaction is being executed.',
        instruction: 'Please do not leave the page.',
      }
    case SafeCreationStatus.ERROR:
      return {
        description: 'There was an error.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.REVERTED:
      return {
        description: 'Transaction was reverted.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.TIMEOUT:
      return {
        description: 'Transaction was not found. Be aware that it might still be processed.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.SUCCESS:
      return {
        description: 'Your Safe was successfully created!',
        instruction: 'It is now being indexed. Please do not leave the page.',
      }
    case SafeCreationStatus.INDEXED:
      return {
        description: 'Your Safe was successfully indexed!',
        instruction: '',
      }
    case SafeCreationStatus.INDEX_FAILED:
      return {
        description: 'Your Safe is created and will be indexed by our services shortly.',
        instruction:
          'You can already open your Safe. It might take a moment until it becomes fully usable in the interface.',
      }
  }
}

const StatusMessage = ({ status }: { status: SafeCreationStatus }) => {
  const stepInfo = getStep(status)

  return (
    <>
      <Box paddingX={3} mt={3}>
        <LoadingSpinner status={status} />
        <Typography variant="h6" marginTop={2} fontWeight={700}>
          {stepInfo.description}
        </Typography>
      </Box>
      {stepInfo.instruction && (
        <Box
          sx={({ palette }) => ({ backgroundColor: palette.warning.background, borderRadius: '6px' })}
          padding={3}
          my={3}
        >
          <Typography variant="body2">{stepInfo.instruction}</Typography>
        </Box>
      )}
    </>
  )
}

export default StatusMessage
