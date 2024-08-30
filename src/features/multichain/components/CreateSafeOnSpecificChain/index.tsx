import NameInput from '@/components/common/NameInput'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material'
import { FormProvider, useForm } from 'react-hook-form'
import { replayCounterfactualSafeDeployment } from '@/features/counterfactual/utils'

import { useAppDispatch, useAppSelector } from '@/store'
import { selectRpc } from '@/store/settingsSlice'
import { createWeb3ReadOnly } from '@/hooks/wallets/web3'
import { predictAddressBasedOnReplayData } from '@/components/welcome/MyAccounts/utils/multiChainSafe'
import { sameAddress } from '@/utils/addresses'
import { type ReplayedSafeProps } from '@/store/slices'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import ChainIndicator from '@/components/common/ChainIndicator'
import { useRouter } from 'next/router'

type CreateSafeOnSpecificChainForm = {
  name: string
}

export const CreateSafeOnSpecificChain = ({
  safeAddress,
  currentName,
  open,
  onClose,
  safeCreationData,
  chain,
}: {
  safeAddress: string
  currentName: string | undefined
  open: boolean
  onClose: () => void
  safeCreationData: ReplayedSafeProps
  chain: ChainInfo
}) => {
  const formMethods = useForm<CreateSafeOnSpecificChainForm>({
    mode: 'all',
    defaultValues: {
      name: currentName,
    },
  })

  const { handleSubmit } = formMethods

  const customRpc = useAppSelector(selectRpc)
  const dispatch = useAppDispatch()
  const router = useRouter()

  const onFormSubmit = handleSubmit(async (data) => {
    // We need to create a readOnly provider of the deployed chain
    const customRpcUrl = customRpc?.[chain.chainId]
    const provider = createWeb3ReadOnly(chain, customRpcUrl)
    if (!provider) {
      return
    }

    // 1. Double check that the creation Data will lead to the correct address
    const predictedAddress = await predictAddressBasedOnReplayData(safeCreationData, provider)
    if (!sameAddress(safeAddress, predictedAddress)) {
      throw new Error('The replayed Safe leads to an unexpected address')
    }

    // 2. Replay Safe creation and add it to the counterfactual Safes
    replayCounterfactualSafeDeployment(chain.chainId, safeAddress, safeCreationData, data.name, dispatch)

    // Open new Safe
    router.push({
      query: {
        safe: `${chain.shortName}:${safeAddress}`,
      },
    })

    // Close modal
    onClose()
  })

  return (
    <Dialog open={open} onClose={onClose}>
      <form onSubmit={onFormSubmit} id="recreate-safe">
        <DialogTitle fontWeight={700}>Add another network</DialogTitle>
        <DialogContent>
          <FormProvider {...formMethods}>
            <Stack spacing={2}>
              <Typography>This action re-deploys a Safe to another network with the same address.</Typography>
              <ErrorMessage level="info">
                The Safe will use the initial setup of the copied Safe. Any changes to owners, threshold, modules or the
                Safe&apos;s version will not be reflected in the copy.
              </ErrorMessage>

              <NameInput name="name" label="Name" />

              <ChainIndicator chainId={chain.chainId} />
            </Stack>
          </FormProvider>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}
