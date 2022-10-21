import { Box, Button, Divider, Grid, Paper, Typography } from '@mui/material'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import useChainId from '@/hooks/useChainId'
import EthHashInfo from '@/components/common/EthHashInfo'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'

import css from './styles.module.css'
import Track from '@/components/common/Track'
import { CREATE_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import ComputedSafeAddress from '@/components/create-safe/status/ComputedSafeAddress'
import useSafeCreationEffects from '@/components/create-safe/status/useSafeCreationEffects'
import { useCallback, useState } from 'react'
import { useSafeCreation } from '@/components/create-safe/status/useSafeCreation'
import type { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import type { PendingSafeData } from '@/components/create-safe'
import useLocalStorage from '@/services/local-storage/useLocalStorage'

const getStep = (status: SafeCreationStatus) => {
  const loading = (
    <img src="/images/open/safe-creation-process.gif" alt="Image of a vault that is loading" className={css.loading} />
  )
  const indexed = <img src="/images/open/safe-creation.svg" alt="Image of a vault" />
  const error = <img src="/images/open/safe-creation-error.svg" alt="Image of a vault with a red error sign" />

  switch (status) {
    case SafeCreationStatus.AWAITING:
      return {
        image: loading,
        description: 'Step 1/2: Waiting for transaction confirmation.',
        instruction: 'Please confirm the transaction with your connected wallet.',
      }
    case SafeCreationStatus.AWAITING_WALLET:
      return {
        image: loading,
        description: 'Waiting for wallet connection',
        instruction: 'Please make sure your wallet is connected on the correct network.',
      }
    case SafeCreationStatus.WALLET_REJECTED:
      return {
        image: loading,
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

export const SAFE_PENDING_CREATION_STORAGE_KEY = 'pendingSafe'

type Props = {
  params: PendingSafeData
  onSubmit: StepRenderProps['onSubmit']
  onBack: StepRenderProps['onBack']
  setStep: StepRenderProps['setStep']
}

export const CreationStatus = ({ params, setStep }: Props) => {
  const [status, setStatus] = useState<SafeCreationStatus>(SafeCreationStatus.AWAITING)
  const [pendingSafe, setPendingSafe] = useLocalStorage<PendingSafeData | undefined>(
    SAFE_PENDING_CREATION_STORAGE_KEY,
    params,
  )
  const chainId = useChainId()
  const chain = useAppSelector((state) => selectChainById(state, chainId))

  const { createSafe, txHash } = useSafeCreation(pendingSafe, setPendingSafe, status, setStatus)

  useSafeCreationEffects({
    pendingSafe,
    setPendingSafe,
    status,
    safeAddress: pendingSafe?.safeAddress,
    setStatus,
    chainId,
  })

  const onClose = useCallback(() => {
    setPendingSafe(undefined)
    setStep(0)
  }, [setPendingSafe, setStep])

  const stepInfo = getStep(status)
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

      {pendingSafe?.safeAddress && <ComputedSafeAddress safeAddress={pendingSafe.safeAddress} />}

      {displaySafeLink && (
        <Box mt={3}>
          <Track {...CREATE_SAFE_EVENTS.GO_TO_SAFE}>
            <Link href={{ pathname: AppRoutes.home, query: { safe: pendingSafe?.safeAddress } }} passHref>
              <Button variant="contained">Open your Safe</Button>
            </Link>
          </Track>
        </Box>
      )}
      <Divider sx={{ marginTop: 3 }} />
      {displayActions && (
        <Grid container padding={3} justifyContent="center" gap={2}>
          <Track {...CREATE_SAFE_EVENTS.CANCEL_CREATE_SAFE}>
            <Button onClick={onClose}>Cancel</Button>
          </Track>
          <Track {...CREATE_SAFE_EVENTS.RETRY_CREATE_SAFE}>
            <Button onClick={createSafe} variant="contained">
              Retry
            </Button>
          </Track>
        </Grid>
      )}
    </Paper>
  )
}
