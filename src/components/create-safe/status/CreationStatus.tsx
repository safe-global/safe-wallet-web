import { Box, Button, Divider, Grid, Paper, Typography, Tooltip } from '@mui/material'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import useChainId from '@/hooks/useChainId'
import EthHashInfo from '@/components/common/EthHashInfo'
import Link from 'next/link'
import { AppRoutes } from '@/config/routes'

import Track from '@/components/common/Track'
import { CREATE_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import ComputedSafeAddress from '@/components/create-safe/status/ComputedSafeAddress'
import useSafeCreationEffects from '@/components/create-safe/status/useSafeCreationEffects'
import { useCallback, useState } from 'react'
import { useSafeCreation } from '@/components/create-safe/status/useSafeCreation'
import type { StepRenderProps } from '@/components/tx/TxStepper/useTxStepper'
import type { PendingSafeData } from '@/components/create-safe'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import StatusMessage from '@/components/create-safe/status/StatusMessage'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'

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
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const isConnected = wallet && !isWrongChain

  const { createSafe, txHash } = useSafeCreation(pendingSafe, setPendingSafe, status, setStatus)

  useSafeCreationEffects({
    pendingSafe,
    setPendingSafe,
    status,
    setStatus,
    chainId,
  })

  const onClose = useCallback(() => {
    setPendingSafe(undefined)
    setStep(0)
  }, [setPendingSafe, setStep])

  const displaySafeLink = status === SafeCreationStatus.INDEX_FAILED

  const displayActions =
    status === SafeCreationStatus.ERROR ||
    status === SafeCreationStatus.REVERTED ||
    status === SafeCreationStatus.TIMEOUT ||
    status === SafeCreationStatus.WALLET_REJECTED

  return (
    <Paper
      sx={{
        textAlign: 'center',
      }}
    >
      <StatusMessage status={status} />

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
            <Tooltip title={!isConnected ? 'Please make sure your wallet is connected on the correct network.' : ''}>
              <span>
                <Button onClick={createSafe} variant="contained" disabled={!isConnected}>
                  Retry
                </Button>
              </span>
            </Tooltip>
          </Track>
        </Grid>
      )}
    </Paper>
  )
}
