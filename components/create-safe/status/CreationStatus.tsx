import { Grid, Box, Button, Divider, Paper, Typography } from '@mui/material'
import Image from 'next/image'

import SafeCreationWaiting from '@/public/images/safe-creation.svg'
import SafeCreationPending from '@/public/images/safe-creation-process.gif'
import SafeCreationError from '@/public/images/safe-creation-error.svg'
import { SafeCreationStatus, useSafeCreation } from '@/components/create-safe/status/useSafeCreation'

type Props = {
  onClose: () => void
}

const getStep = (status: SafeCreationStatus) => {
  switch (status) {
    case SafeCreationStatus.PENDING:
      return {
        image: <Image src={SafeCreationPending} alt="Image of a vault that is loading" width={111} height={91} />,
        description: 'Transaction is pending.',
        instruction: 'Please do not leave the page.',
      }
    case SafeCreationStatus.ERROR:
      return {
        image: <Image src={SafeCreationError} alt="Image of a vault with a red error sign" />,
        description: 'There was an error.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.SUCCESS:
      return {
        image: <Image src={SafeCreationWaiting} alt="Image of a vault" />,
        description: 'Your Safe was successfully created!',
        instruction: 'Press continue to get to your Dashboard.',
      }
  }
}

export const CreationStatus = ({ onClose }: Props) => {
  const { status, onRetry } = useSafeCreation()
  const stepInfo = getStep(status)

  return (
    <Paper
      sx={{
        textAlign: 'center',
      }}
    >
      <Box padding={3}>
        {stepInfo.image}
        <Typography variant="h4" marginTop={2}>
          {stepInfo.description}
        </Typography>
      </Box>
      <Box sx={({ palette }) => ({ backgroundColor: palette.primary.main })} padding={3} marginBottom={6}>
        <Typography variant="h4" color="white">
          {stepInfo.instruction}
        </Typography>
      </Box>
      <Divider />
      {status === SafeCreationStatus.ERROR && (
        <Grid container padding={3} justifyContent="center" gap={2}>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={onRetry} variant="contained">
            Retry
          </Button>
        </Grid>
      )}
    </Paper>
  )
}
