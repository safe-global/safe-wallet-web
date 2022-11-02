import { useCallback } from 'react'
import { Box, Button, Divider, Grid, Paper, Tooltip } from '@mui/material'
import { useRouter } from 'next/router'

import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import Track from '@/components/common/Track'
import { CREATE_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import StatusMessage from '@/components/new-safe/steps/Step4/StatusMessage'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import useStatus from '@/components/create-safe/status/useStatus'
import type { NewSafeFormData } from '@/components/new-safe/CreateSafe'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { PendingSafeTx } from '@/components/create-safe/types.d'
import useSafeCreationEffects from '@/components/new-safe/steps/Step4/useSafeCreationEffects'
import { useSafeCreation } from '@/components/new-safe/steps/Step4/useSafeCreation'
import StatusStepper from '@/components/new-safe/steps/Step4/StatusStepper'
import { trackEvent } from '@/services/analytics'
import useChainId from '@/hooks/useChainId'
import { getRedirect } from '@/components/new-safe/steps/Step4/logic'

export const SAFE_PENDING_CREATION_STORAGE_KEY = 'pendingSafe'

export type PendingSafeData = NewSafeFormData & {
  txHash?: string
  tx?: PendingSafeTx
  safeAddress?: string
  saltNonce: number
}

export const CreateSafeStatus = ({ setStep }: StepRenderProps<NewSafeFormData>) => {
  const [status, setStatus] = useStatus()
  const [pendingSafe, setPendingSafe] = useLocalStorage<PendingSafeData | undefined>(SAFE_PENDING_CREATION_STORAGE_KEY)
  const router = useRouter()
  const chainId = useChainId()
  const wallet = useWallet()
  const isWrongChain = useIsWrongChain()
  const isConnected = wallet && !isWrongChain

  const { createSafe } = useSafeCreation(pendingSafe, setPendingSafe, status, setStatus)

  useSafeCreationEffects({
    pendingSafe,
    setPendingSafe,
    status,
    setStatus,
  })

  const onClose = useCallback(() => {
    setPendingSafe(undefined)
    setStep(0)
  }, [setPendingSafe, setStep])

  const onCreate = useCallback(() => {
    setStatus(SafeCreationStatus.AWAITING)
    void createSafe()
  }, [createSafe, setStatus])

  const onFinish = useCallback(() => {
    trackEvent(CREATE_SAFE_EVENTS.GET_STARTED)

    const { safeAddress } = pendingSafe || {}

    if (safeAddress) {
      setPendingSafe(undefined)
      router.push(getRedirect(chainId, safeAddress, router.query?.safeViewRedirectURL))
    }
  }, [chainId, pendingSafe, router, setPendingSafe])

  const displaySafeLink = status >= SafeCreationStatus.INDEXED
  const displayActions = status >= SafeCreationStatus.WALLET_REJECTED && status <= SafeCreationStatus.TIMEOUT

  return (
    <Paper
      sx={{
        textAlign: 'center',
      }}
    >
      <StatusMessage status={status} />

      {!displayActions && pendingSafe && (
        <>
          <Divider sx={{ ml: '-52px', mr: '-52px', mb: 4, mt: 4, alignSelf: 'normal' }} />
          <StatusStepper pendingSafe={pendingSafe} status={status} />
        </>
      )}

      {displaySafeLink && (
        <>
          <Divider sx={{ ml: '-52px', mr: '-52px', mb: 3, mt: 3, alignSelf: 'normal' }} />
          <Box mt={3}>
            <Track {...CREATE_SAFE_EVENTS.GO_TO_SAFE}>
              <Button variant="contained" onClick={onFinish}>
                Start using Safe
              </Button>
            </Track>
          </Box>
        </>
      )}

      {displayActions && (
        <>
          <Divider sx={{ ml: '-52px', mr: '-52px', mb: 3, mt: 3, alignSelf: 'normal' }} />
          <Grid container justifyContent="center" gap={2}>
            <Track {...CREATE_SAFE_EVENTS.CANCEL_CREATE_SAFE}>
              <Button onClick={onClose}>Cancel</Button>
            </Track>
            <Track {...CREATE_SAFE_EVENTS.RETRY_CREATE_SAFE}>
              <Tooltip title={!isConnected ? 'Please make sure your wallet is connected on the correct network.' : ''}>
                <span>
                  <Button onClick={onCreate} variant="contained" disabled={!isConnected}>
                    Retry
                  </Button>
                </span>
              </Tooltip>
            </Track>
          </Grid>
        </>
      )}
    </Paper>
  )
}
