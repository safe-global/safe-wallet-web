import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { SafeCreationStatus, useSafeCreation } from '@/components/create-safe/status/useSafeCreation'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import useChainId from '@/hooks/useChainId'
import EthHashInfo from '@/components/common/EthHashInfo'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'

type Props = {
  onClose: () => void
}

const getStep = (status: SafeCreationStatus) => {
  switch (status) {
    case SafeCreationStatus.AWAITING:
      return {
        image: (
          <img src="/images/safe-creation-process.gif" alt="Image of a vault that is loading" width={111} height={91} />
        ),
        description: 'Step 1/2: Waiting for transaction confirmation.',
        instruction: 'Please confirm the transaction with your connected wallet.',
      }
    case SafeCreationStatus.MINING:
      return {
        image: (
          <img src="/images/safe-creation-process.gif" alt="Image of a vault that is loading" width={111} height={91} />
        ),
        description: 'Step 2/2: Transaction is being executed.',
        instruction: 'Please do not leave the page.',
      }
    case SafeCreationStatus.ERROR:
      return {
        image: <img src="/images/safe-creation-error.svg" alt="Image of a vault with a red error sign" />,
        description: 'There was an error.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.REVERTED:
      return {
        image: <img src="/images/safe-creation-error.svg" alt="Image of a vault with a red error sign" />,
        description: 'Transaction was reverted.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.TIMEOUT:
      return {
        image: <img src="/images/safe-creation-error.svg" alt="Image of a vault with a red error sign" />,
        description: 'Transaction was not found. Be aware that it might still be mined.',
        instruction: 'You can cancel or retry the Safe creation process.',
      }
    case SafeCreationStatus.SUCCESS:
      return {
        image: (
          <img src="/images/safe-creation-process.gif" alt="Image of a vault that is loading" width={111} height={91} />
        ),
        description: 'Your Safe was successfully created!',
        instruction: 'It is now being indexed. Please do not leave the page.',
      }
    case SafeCreationStatus.INDEXED:
      return {
        image: <img src="/images/safe-creation.svg" alt="Image of a vault" />,
        description: 'Your Safe was successfully indexed!',
        instruction: 'Taking you to your dashboard...',
      }
    case SafeCreationStatus.INDEX_FAILED:
      return {
        image: <img src="/images/safe-creation-error.svg" alt="Image of a vault with a red error sign" />,
        description: 'Your Safe is created and will be indexed by our services shortly.',
        instruction:
          'You can already open your Safe. It might take a moment until it becomes fully usable in the interface.',
      }
  }
}

export const CreationStatus = ({ onClose }: Props) => {
  const { status, onRetry, txHash, safeAddress } = useSafeCreation()
  const stepInfo = getStep(status)
  const chainId = useChainId()
  const chain = useAppSelector((state) => selectChainById(state, chainId))

  const displaySafeLink = status === SafeCreationStatus.INDEX_FAILED

  const displayActions =
    status === SafeCreationStatus.ERROR ||
    status === SafeCreationStatus.REVERTED ||
    status === SafeCreationStatus.TIMEOUT

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
      <Box sx={({ palette }) => ({ backgroundColor: palette.primary.main })} padding={3} mb={3}>
        <Typography variant="h4" color="white">
          {stepInfo.instruction}
        </Typography>
      </Box>
      {txHash && chain && (
        <Box mb={3}>
          <Typography>Your Safe creation transaction:</Typography>
          <Box display="flex" justifyContent="center">
            <EthHashInfo address={txHash} hasExplorer shortAddress={false} showAvatar={false} />
          </Box>
        </Box>
      )}
      {safeAddress && !displaySafeLink && (
        <Box display="flex" flexDirection="column" alignItems="center" px={3}>
          <Typography>Your safe will have the following address after creation:</Typography>
          <EthHashInfo
            address={safeAddress}
            hasExplorer={status === SafeCreationStatus.SUCCESS}
            shortAddress={false}
            showCopyButton
          />
        </Box>
      )}
      {displaySafeLink && (
        <Box mt={3}>
          <Link href={{ pathname: AppRoutes.safe.home, query: { safe: safeAddress } }} passHref>
            <Button variant="contained">Open your safe</Button>
          </Link>
        </Box>
      )}
      <Divider sx={{ marginTop: 3 }} />
      {displayActions && (
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
