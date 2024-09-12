import NameInput from '@/components/common/NameInput'
import NetworkInput from '@/components/common/NetworkInput'
import ErrorMessage from '@/components/tx/ErrorMessage'
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { useSafeCreationData } from '../../hooks/useSafeCreationData'
import { useReplayableNetworks } from '../../hooks/useReplayableNetworks'
import { replayCounterfactualSafeDeployment } from '@/features/counterfactual/utils'

import useChains from '@/hooks/useChains'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectRpc } from '@/store/settingsSlice'
import { createWeb3ReadOnly } from '@/hooks/wallets/web3'
import { predictAddressBasedOnReplayData } from '@/components/welcome/MyAccounts/utils/multiChainSafe'
import { sameAddress } from '@/utils/addresses'
import { useRouter } from 'next/router'
import ChainIndicator from '@/components/common/ChainIndicator'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { useMemo, useState } from 'react'

type CreateSafeOnNewChainForm = {
  name: string
  chainId: string
}

type ReplaySafeDialogProps = {
  safeAddress: string
  safeCreationResult: ReturnType<typeof useSafeCreationData>
  replayableChains?: ReturnType<typeof useReplayableNetworks>
  chain?: ChainInfo
  currentName: string | undefined
  open: boolean
  onClose: () => void
}

const ReplaySafeDialog = ({
  safeAddress,
  chain,
  currentName,
  open,
  onClose,
  safeCreationResult,
  replayableChains,
}: ReplaySafeDialogProps) => {
  const formMethods = useForm<CreateSafeOnNewChainForm>({
    mode: 'all',
    defaultValues: {
      name: currentName,
      chainId: chain?.chainId,
    },
  })

  const { handleSubmit } = formMethods
  const router = useRouter()

  const customRpc = useAppSelector(selectRpc)
  const dispatch = useAppDispatch()
  const [creationError, setCreationError] = useState<Error>()

  // Load some data
  const [safeCreationData, safeCreationDataError, safeCreationDataLoading] = safeCreationResult

  const onFormSubmit = handleSubmit(async (data) => {
    const selectedChain = chain ?? replayableChains?.find((config) => config.chainId === data.chainId)
    if (!safeCreationData || !safeCreationData.setupData || !selectedChain || !safeCreationData.masterCopy) {
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

  const submitDisabled = !!safeCreationDataError || safeCreationDataLoading || !formMethods.formState.isValid

  return (
    <Dialog open={open} onClose={onClose} onClick={(e) => e.stopPropagation()}>
      <form onSubmit={onFormSubmit} id="recreate-safe">
        <DialogTitle fontWeight={700}>Add another network</DialogTitle>
        <DialogContent>
          {safeCreationDataError ? (
            <ErrorMessage error={safeCreationDataError} level="error">
              Could not determine the Safe creation parameters.
            </ErrorMessage>
          ) : (
            <FormProvider {...formMethods}>
              <Stack spacing={2}>
                <Typography>This action re-deploys a Safe to another network with the same address.</Typography>
                <ErrorMessage level="info">
                  The Safe will use the initial setup of the copied Safe. Any changes to owners, threshold, modules or
                  the Safe&apos;s version will not be reflected in the copy.
                </ErrorMessage>

                {safeCreationDataLoading ? (
                  <Stack direction="column" alignItems="center" gap={1}>
                    <CircularProgress />
                    <Typography variant="body2">Loading Safe data</Typography>
                  </Stack>
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
          )}
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitDisabled}>
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export const CreateSafeOnNewChain = ({
  safeAddress,
  deployedChainIds,
  ...props
}: Omit<ReplaySafeDialogProps, 'safeCreationResult' | 'replayableChains' | 'chain'> & {
  deployedChainIds: string[]
}) => {
  const { configs } = useChains()
  const deployedChains = useMemo(
    () => configs.filter((config) => config.chainId === deployedChainIds[0]),
    [configs, deployedChainIds],
  )

  const safeCreationResult = useSafeCreationData(safeAddress, deployedChains)
  const replayableChains = useReplayableNetworks(safeCreationResult[0], deployedChainIds)

  return (
    <ReplaySafeDialog
      safeCreationResult={safeCreationResult}
      replayableChains={replayableChains}
      safeAddress={safeAddress}
      {...props}
    />
  )
}

export const CreateSafeOnSpecificChain = ({ ...props }: Omit<ReplaySafeDialogProps, 'replayableChains'>) => {
  return <ReplaySafeDialog {...props} />
}
