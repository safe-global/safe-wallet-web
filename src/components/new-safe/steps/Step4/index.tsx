import { useCallback, useEffect, useState } from 'react'
import { Box, Button, Divider, Paper, Tooltip, Typography } from '@mui/material'
import { useRouter } from 'next/router'

import Track from '@/components/common/Track'
import { CREATE_SAFE_EVENTS } from '@/services/analytics/events/createLoadSafe'
import useLocalStorage from '@/services/local-storage/useLocalStorage'
import StatusMessage from '@/components/new-safe/steps/Step4/StatusMessage'
import useWallet from '@/hooks/wallets/useWallet'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import type { NewSafeFormData } from '@/components/new-safe/CreateSafe'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { PendingSafeTx } from '@/components/create-safe/types.d'
import useSafeCreationEffects from '@/components/new-safe/steps/Step4/useSafeCreationEffects'
import { SafeCreationStatus, useSafeCreation } from '@/components/new-safe/steps/Step4/useSafeCreation'
import StatusStepper from '@/components/new-safe/steps/Step4/StatusStepper'
import { trackEvent } from '@/services/analytics'
import useChainId from '@/hooks/useChainId'
import { getRedirect } from '@/components/new-safe/steps/Step4/logic'
import layoutCss from '@/components/new-safe/CreateSafe/styles.module.css'
import { AppRoutes } from '@/config/routes'
import palette from '@/styles/colors'

export const SAFE_PENDING_CREATION_STORAGE_KEY = 'pendingSafe'

export type PendingSafeData = NewSafeFormData & {
  txHash?: string
  tx?: PendingSafeTx
}

export const CreateSafeStatus = ({ setProgressColor }: StepRenderProps<NewSafeFormData>) => {
  const [status, setStatus] = useState<SafeCreationStatus>(SafeCreationStatus.AWAITING)
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
    router.push(AppRoutes.welcome)
  }, [router, setPendingSafe])

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
  const isError = status >= SafeCreationStatus.WALLET_REJECTED && status <= SafeCreationStatus.TIMEOUT

  useEffect(() => {
    if (!setProgressColor) return

    if (isError) {
      setProgressColor(palette.error.main)
    } else {
      setProgressColor(palette.secondary.main)
    }
  }, [isError, setProgressColor])

  return (
    <Paper
      sx={{
        textAlign: 'center',
      }}
    >
      <Box className={layoutCss.row}>
        <StatusMessage status={status} isError={isError} />
      </Box>

      {!isError && pendingSafe && (
        <>
          <Divider />
          <Box className={layoutCss.row}>
            <StatusStepper pendingSafe={pendingSafe} status={status} />
          </Box>
        </>
      )}

      {displaySafeLink && (
        <>
          <Divider />
          <Box className={layoutCss.row}>
            <Track {...CREATE_SAFE_EVENTS.GO_TO_SAFE}>
              <Button variant="contained" onClick={onFinish}>
                Start using Safe
              </Button>
            </Track>
          </Box>
        </>
      )}

      {isError && (
        <>
          <Divider />
          <Box className={layoutCss.row}>
            <Box display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
              <Track {...CREATE_SAFE_EVENTS.CANCEL_CREATE_SAFE}>
                <Button onClick={onClose} variant="outlined">
                  Cancel
                </Button>
              </Track>
              <Track {...CREATE_SAFE_EVENTS.RETRY_CREATE_SAFE}>
                <Tooltip
                  title={!isConnected ? 'Please make sure your wallet is connected on the correct network.' : ''}
                >
                  <Typography display="flex" height={1}>
                    <Button onClick={onCreate} variant="contained" disabled={!isConnected}>
                      Retry
                    </Button>
                  </Typography>
                </Tooltip>
              </Track>
            </Box>
          </Box>
        </>
      )}
    </Paper>
  )
}
