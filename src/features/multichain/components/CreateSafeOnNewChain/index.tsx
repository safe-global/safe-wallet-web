import NameInput from '@/components/common/NameInput'
import NetworkInput from '@/components/common/NetworkInput'
import ErrorMessage from '@/components/tx/ErrorMessage'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Stack,
  Typography,
} from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { useSafeCreationData } from '../../hooks/useSafeCreationData'
import { useReplayableNetworks } from '../../hooks/useReplayableNetworks'
import { useMemo } from 'react'
import { replayCounterfactualSafeDeployment } from '@/features/counterfactual/utils'

import useChains from '@/hooks/useChains'
import { useAppDispatch, useAppSelector } from '@/store'
import { selectRpc } from '@/store/settingsSlice'
import { createWeb3ReadOnly } from '@/hooks/wallets/web3'
import { predictAddressBasedOnReplayData } from '@/components/welcome/MyAccounts/utils/multiChainSafe'
import { sameAddress } from '@/utils/addresses'
import ExternalLink from '@/components/common/ExternalLink'

type CreateSafeOnNewChainForm = {
  name: string
  chainId: string
}

export const CreateSafeOnNewChain = ({
  safeAddress,
  deployedChainIds,
  currentName,
  open,
  onClose,
}: {
  safeAddress: string
  deployedChainIds: string[]
  currentName: string | undefined
  open: boolean
  onClose: () => void
}) => {
  const formMethods = useForm<CreateSafeOnNewChainForm>({
    mode: 'all',
    defaultValues: {
      name: currentName,
    },
  })
  const { handleSubmit, formState } = formMethods
  const { configs } = useChains()

  const chain = configs.find((config) => config.chainId === deployedChainIds[0])

  const customRpc = useAppSelector(selectRpc)
  const dispatch = useAppDispatch()

  // Load some data
  const [safeCreationData, safeCreationDataError] = useSafeCreationData(safeAddress, chain)

  const onFormSubmit = handleSubmit(async (data) => {
    const selectedChain = configs.find((config) => config.chainId === data.chainId)
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
      throw new Error('The replayed Safe leads to an unexpected address')
    }

    // 2. Replay Safe creation and add it to the counterfactual Safes
    replayCounterfactualSafeDeployment(selectedChain.chainId, safeAddress, safeCreationData, data.name, dispatch)

    // Close modal
    onClose()
  })

  const replayableChains = useReplayableNetworks(safeCreationData)
  const isLoading = !replayableChains

  const newReplayableChains = useMemo(() => {
    if (!replayableChains) return []
    return replayableChains.filter((chain) => !deployedChainIds.includes(chain.chainId))
  }, [deployedChainIds, replayableChains])

  const isUnsupportedSafeCreationVersion = !newReplayableChains.length
  const submitDisabled = isUnsupportedSafeCreationVersion || !!safeCreationDataError || !formState.isValid

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={onFormSubmit} id="recreate-safe">
        <DialogTitle fontWeight={700}>Add another network</DialogTitle>
        <Divider />
        <DialogContent>
          {safeCreationDataError ? (
            <ErrorMessage error={safeCreationDataError} level="error">
              Could not determine the Safe creation parameters.
            </ErrorMessage>
          ) : isLoading ? (
            <Box my={16} px="auto" display="flex" alignItems="center" justifyContent="center">
              <CircularProgress size={20} />
            </Box>
          ) : isUnsupportedSafeCreationVersion ? (
            <Typography>
              This account was created from an outdated mastercopy. Adding another network is not possible.
            </Typography>
          ) : (
            <FormProvider {...formMethods}>
              <Stack spacing={2}>
                <Typography>This action re-deploys a Safe to another network with the same address.</Typography>
                <ErrorMessage level="info">
                  The Safe will use the initial setup of the copied Safe. Any changes to owners, threshold, modules or
                  the Safe&apos;s version will not be reflected in the copy.
                </ErrorMessage>

                <NameInput name="name" label="Name" />

                <NetworkInput required name="chainId" chainConfigs={newReplayableChains} />
              </Stack>
            </FormProvider>
          )}
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
              <Button variant="outlined" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitDisabled}>
                Add network
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  )
}
