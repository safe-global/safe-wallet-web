import ModalDialog from '@/components/common/ModalDialog'
import NameInput from '@/components/common/NameInput'
import NetworkInput from '@/components/common/NetworkInput'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { Box, Button, CircularProgress, DialogActions, DialogContent, Divider, Stack, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { useSafeCreationData } from '../../hooks/useSafeCreationData'
import { replayCounterfactualSafeDeployment } from '@/features/counterfactual/utils'

import useChains from '@/hooks/useChains'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectRpc } from '@/store/settingsSlice'
import { createWeb3ReadOnly } from '@/hooks/wallets/web3'
import { predictAddressBasedOnReplayData } from '@/components/welcome/MyAccounts/utils/multiChainSafe'
import { sameAddress } from '@/utils/addresses'
import ExternalLink from '@/components/common/ExternalLink'
import { useRouter } from 'next/router'
import ChainIndicator from '@/components/common/ChainIndicator'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useMemo, useState } from 'react'
import { useCompatibleNetworks } from '../../hooks/useCompatibleNetworks'

type CreateSafeOnNewChainForm = {
  name: string
  chainId: string
}

type ReplaySafeDialogProps = {
  safeAddress: string
  safeCreationResult: ReturnType<typeof useSafeCreationData>
  replayableChains?: ReturnType<typeof useCompatibleNetworks>
  chain?: ChainInfo
  currentName: string | undefined
  open: boolean
  onClose: () => void
  isUnsupportedSafeCreationVersion?: boolean
}

const ReplaySafeDialog = ({
  safeAddress,
  chain,
  currentName,
  open,
  onClose,
  safeCreationResult,
  replayableChains,
  isUnsupportedSafeCreationVersion,
}: ReplaySafeDialogProps) => {
  const formMethods = useForm<CreateSafeOnNewChainForm>({
    mode: 'all',
    defaultValues: {
      name: currentName,
      chainId: chain?.chainId || '',
    },
  })
  const { handleSubmit, formState } = formMethods
  const router = useRouter()

  const customRpc = useAppSelector(selectRpc)
  const dispatch = useAppDispatch()
  const [creationError, setCreationError] = useState<Error>()

  // Load some data
  const [safeCreationData, safeCreationDataError, safeCreationDataLoading] = safeCreationResult

  const onCancel = () => {
    trackEvent({ ...OVERVIEW_EVENTS.CANCEL_ADD_NEW_NETWORK })
    onClose()
  }

  const onFormSubmit = handleSubmit(async (data) => {
    const selectedChain = chain ?? replayableChains?.find((config) => config.chainId === data.chainId)
    if (!safeCreationData || !selectedChain) {
      return
    }

    // We need to create a readOnly provider of the deployed chain
    const customRpcUrl = selectedChain ? customRpc?.[selectedChain.chainId] : undefined
    const provider = createWeb3ReadOnly(selectedChain, customRpcUrl)
    if (!provider) {
      return
    }

    // 1. Double check that the creation Data will lead to the correct address
    const predictedAddress = await predictAddressBasedOnReplayData(safeCreationData, provider)
    if (!sameAddress(safeAddress, predictedAddress)) {
      setCreationError(new Error('The replayed Safe leads to an unexpected address'))
      return
    }

    trackEvent({ ...OVERVIEW_EVENTS.SUBMIT_ADD_NEW_NETWORK, label: selectedChain.chainName })

    // 2. Replay Safe creation and add it to the counterfactual Safes
    replayCounterfactualSafeDeployment(selectedChain.chainId, safeAddress, safeCreationData, data.name, dispatch)

    router.push({
      query: {
        safe: `${selectedChain.shortName}:${safeAddress}`,
      },
    })

    // Close modal
    onClose()
  })

  const submitDisabled =
    isUnsupportedSafeCreationVersion || !!safeCreationDataError || safeCreationDataLoading || !formState.isValid

  const noChainsAvailable =
    !chain && safeCreationData && replayableChains && replayableChains.filter((chain) => chain.available).length === 0

  return (
    <ModalDialog open={open} onClose={onClose} dialogTitle="Add another network" hideChainIndicator>
      <form onSubmit={onFormSubmit} id="recreate-safe">
        <DialogContent>
          <FormProvider {...formMethods}>
            <Stack spacing={2}>
              <Typography>This action re-deploys a Safe to another network with the same address.</Typography>
              <ErrorMessage level="info">
                The Safe will use the initial setup of the copied Safe. Any changes to owners, threshold, modules or the
                Safe&apos;s version will not be reflected in the copy.
              </ErrorMessage>

              {safeCreationDataLoading ? (
                <Stack direction="column" alignItems="center" gap={1}>
                  <CircularProgress />
                  <Typography variant="body2">Loading Safe data</Typography>
                </Stack>
              ) : safeCreationDataError ? (
                <ErrorMessage error={safeCreationDataError} level="error">
                  Could not determine the Safe creation parameters.
                </ErrorMessage>
              ) : isUnsupportedSafeCreationVersion ? (
                <ErrorMessage>
                  This account was created from an outdated mastercopy. Adding another network is not possible.
                </ErrorMessage>
              ) : noChainsAvailable ? (
                <ErrorMessage level="error">This Safe cannot be replayed on any chains.</ErrorMessage>
              ) : (
                <>
                  <NameInput name="name" label="Name" />

                  {chain ? (
                    <ChainIndicator chainId={chain.chainId} />
                  ) : (
                    <NetworkInput required name="chainId" chainConfigs={replayableChains ?? []} />
                  )}
                </>
              )}

              {creationError && (
                <ErrorMessage error={creationError} level="error">
                  The Safe could not be created with the same address.
                </ErrorMessage>
              )}
            </Stack>
          </FormProvider>
        </DialogContent>
        <Divider />
        <DialogActions sx={{ m: 2 }}>
          {isUnsupportedSafeCreationVersion ? (
            <Box display="flex" width="100%" alignItems="center" justifyContent="space-between">
              <ExternalLink sx={{ flexGrow: 1 }} href="https://safe.global">
                Read more
              </ExternalLink>
              <Button variant="contained" onClick={onClose}>
                Got it
              </Button>
            </Box>
          ) : (
            <>
              <Button variant="outlined" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitDisabled}>
                Add network
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </ModalDialog>
  )
}

export const CreateSafeOnNewChain = ({
  safeAddress,
  deployedChainIds,
  ...props
}: Omit<
  ReplaySafeDialogProps,
  'safeCreationResult' | 'replayableChains' | 'chain' | 'isUnsupportedSafeCreationVersion'
> & {
  deployedChainIds: string[]
}) => {
  const { configs } = useChains()
  const deployedChains = useMemo(
    () => configs.filter((config) => config.chainId === deployedChainIds[0]),
    [configs, deployedChainIds],
  )

  const safeCreationResult = useSafeCreationData(safeAddress, deployedChains)
  const allCompatibleChains = useCompatibleNetworks(safeCreationResult[0])
  const isUnsupportedSafeCreationVersion = Boolean(!allCompatibleChains?.length)
  const replayableChains = useMemo(
    () => allCompatibleChains?.filter((config) => !deployedChainIds.includes(config.chainId)) || [],
    [allCompatibleChains, deployedChainIds],
  )

  return (
    <ReplaySafeDialog
      safeCreationResult={safeCreationResult}
      replayableChains={replayableChains}
      safeAddress={safeAddress}
      isUnsupportedSafeCreationVersion={isUnsupportedSafeCreationVersion}
      {...props}
    />
  )
}

export const CreateSafeOnSpecificChain = ({ ...props }: Omit<ReplaySafeDialogProps, 'replayableChains'>) => {
  return <ReplaySafeDialog {...props} isUnsupportedSafeCreationVersion={false} />
}
