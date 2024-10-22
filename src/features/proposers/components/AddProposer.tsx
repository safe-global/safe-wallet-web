import AddressInput from '@/components/common/AddressInput'
import NameInput from '@/components/common/NameInput'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { getDelegateTypedData } from '@/features/proposers/utils/utils'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import useWallet from '@/hooks/wallets/useWallet'
import { SETTINGS_EVENTS, trackEvent } from '@/services/analytics'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'
import { useAddDelegateMutation } from '@/store/api/gateway'
import { signTypedData } from '@/utils/web3'
import { Close } from '@mui/icons-material'
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Typography,
} from '@mui/material'
import { type BaseSyntheticEvent, useState } from 'react'
import { FormProvider, useForm } from 'react-hook-form'

type AddProposerProps = {
  onClose: () => void
  onSuccess: () => void
}

enum DelegateEntryFields {
  address = 'address',
  name = 'name',
}

type DelegateEntry = {
  [DelegateEntryFields.name]: string
  [DelegateEntryFields.address]: string
}

const AddProposer = ({ onClose, onSuccess }: AddProposerProps) => {
  const [error, setError] = useState<Error>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [addDelegate] = useAddDelegateMutation()

  const chainId = useChainId()
  const wallet = useWallet()
  const safeAddress = useSafeAddress()

  const methods = useForm<DelegateEntry>({
    defaultValues: {
      [DelegateEntryFields.address]: '',
      [DelegateEntryFields.name]: '',
    },
    mode: 'onChange',
  })

  const { handleSubmit } = methods

  const onConfirm = handleSubmit(async (data: DelegateEntry) => {
    if (!wallet) return

    setError(undefined)
    setIsLoading(true)

    try {
      const signer = await getAssertedChainSigner(wallet.provider)
      const typedData = getDelegateTypedData(chainId, data.address)

      const signature = await signTypedData(signer, typedData)
      await addDelegate({
        chainId,
        delegator: wallet.address,
        signature,
        label: data.name,
        delegate: data.address,
        safeAddress,
      })
      trackEvent(SETTINGS_EVENTS.PROPOSERS.SUBMIT_ADD_PROPOSER)
    } catch (error) {
      setIsLoading(false)
      setError(error as Error)
      return
    }

    setIsLoading(false)
    onSuccess()
  })

  const onSubmit = (e: BaseSyntheticEvent) => {
    e.stopPropagation()
    onConfirm(e)
  }

  const onCancel = () => {
    trackEvent(SETTINGS_EVENTS.PROPOSERS.CANCEL_ADD_PROPOSER)
    onClose()
  }

  return (
    <Dialog open onClose={onCancel}>
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogTitle>
            <Box data-testid="untrusted-token-warning" display="flex" alignItems="center">
              <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Add delegate
              </Typography>

              <Box flexGrow={1} />

              <IconButton aria-label="close" onClick={onCancel} sx={{ marginLeft: 'auto' }}>
                <Close />
              </IconButton>
            </Box>
          </DialogTitle>

          <Divider />

          <DialogContent>
            <Box>
              This will add a delegate to your Safe. The delegate will be able to propose transactions but not sign
              them. A name for the delegate is required. This name will be publicly accessible.
            </Box>

            <Box my={2}>
              <NameInput name="name" label="Name" autoFocus required />
            </Box>

            <AddressInput name="address" label="Delegate" variant="outlined" fullWidth required />

            {error && (
              <Box mt={2}>
                <ErrorMessage error={error}>Error adding delegate</ErrorMessage>
              </Box>
            )}
          </DialogContent>

          <Divider />

          <DialogActions sx={{ padding: 3, justifyContent: 'space-between' }}>
            <Button size="small" variant="text" onClick={onCancel}>
              Cancel
            </Button>

            <Button
              size="small"
              variant="contained"
              color="primary"
              type="submit"
              disabled={isLoading}
              sx={{ minWidth: '122px', minHeight: '36px' }}
            >
              {isLoading ? <CircularProgress size={20} /> : 'Submit'}
            </Button>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  )
}

export default AddProposer
