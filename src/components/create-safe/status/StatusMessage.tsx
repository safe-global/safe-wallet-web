import { Box, Typography } from '@mui/material'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import css from '@/components/create-safe/status/styles.module.css'
import classNames from 'classnames'

const getStep = (status: SafeCreationStatus) => {
  const loading = (
    <img
      src="/images/open/safe-creation-process.gif"
      alt="Image of a vault that is loading"
      className={classNames(css.image, css.loading)}
    />
  )
  const indexed = <img src="/images/open/safe-creation.svg" alt="Image of a vault" className={css.image} />
  const error = (
    <img
      src="/images/open/safe-creation-error.svg"
      alt="Image of a vault with a red error sign"
      className={css.image}
    />
  )

  switch (status) {
    case SafeCreationStatus.AWAITING:
      return {
        image: loading,
        description: 'Step 1/2: Waiting for transaction confirmation.',
        instruction: 'Please confirm the transaction with your connected wallet.',
      }
    case SafeCreationStatus.WALLET_REJECTED:
      return {
        image: error,
        description: 'Transaction was rejected.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.PROCESSING:
      return {
        image: loading,
        description: 'Step 2/2: Transaction is being executed.',
        instruction: 'Please do not leave the page.',
      }
    case SafeCreationStatus.ERROR:
      return {
        image: error,
        description: 'There was an error.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.REVERTED:
      return {
        image: error,
        description: 'Transaction was reverted.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.TIMEOUT:
      return {
        image: error,
        description: 'Transaction was not found. Be aware that it might still be processed.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.SUCCESS:
      return {
        image: loading,
        description: 'Your Safe was successfully created!',
        instruction: 'It is now being indexed. Please do not leave the page.',
      }
    case SafeCreationStatus.INDEXED:
      return {
        image: indexed,
        description: 'Your Safe was successfully indexed!',
        instruction: 'Taking you to your dashboard...',
      }
    case SafeCreationStatus.INDEX_FAILED:
      return {
        image: error,
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
      <Box padding={3}>
        {stepInfo.image}
        <Typography variant="h4" marginTop={2}>
          {stepInfo.description}
        </Typography>
      </Box>
      <Box sx={({ palette }) => ({ backgroundColor: palette.primary.main })} padding={3} mb={3}>
        <Typography variant="h4" color="white">
          {stepInfo.instruction}
        </Typography>
      </Box>
    </>
  )
}

export default StatusMessage
