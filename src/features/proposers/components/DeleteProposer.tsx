import { getDelegateTypedData } from '@/features/proposers/utils/utils'
import useWallet from '@/hooks/wallets/useWallet'
import { useDeleteDelegateMutation } from '@/store/api/gateway'
import { signTypedData } from '@/utils/web3'
import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  Typography,
  IconButton,
  Divider,
  DialogContent,
  DialogActions,
  Button,
  Box,
  CircularProgress,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import madProps from '@/utils/mad-props'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'
import ErrorMessage from '@/components/tx/ErrorMessage'

type DeleteProposerProps = {
  onClose: () => void
  onSuccess: () => void
  wallet: ReturnType<typeof useWallet>
  chainId: ReturnType<typeof useChainId>
  safeAddress: ReturnType<typeof useSafeAddress>
  delegateAddress: string
}

const _DeleteProposer = ({
  onSuccess,
  onClose,
  wallet,
  safeAddress,
  chainId,
  delegateAddress,
}: DeleteProposerProps) => {
  const [error, setError] = useState<Error>()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [deleteDelegate] = useDeleteDelegateMutation()

  const onConfirm = async () => {
    setError(undefined)
    setIsLoading(true)

    if (!wallet?.provider || !safeAddress || !chainId) {
      setIsLoading(false)
      setError(new Error('Please connect your wallet first'))
      return
    }

    try {
      const signer = await getAssertedChainSigner(wallet.provider)
      const typedData = getDelegateTypedData(chainId, delegateAddress)

      const signature = await signTypedData(signer, typedData)
      await deleteDelegate({ chainId, delegateAddress, safeAddress, signature })
    } catch (error) {
      setIsLoading(false)
      setError(error as Error)
      return
    }

    setIsLoading(false)
    onSuccess()
  }

  const onCancel = () => {
    onClose()
  }

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Typography variant="h6" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            Delete this delegate?
          </Typography>

          <Box flexGrow={1} />

          <IconButton aria-label="close" onClick={onClose} sx={{ marginLeft: 'auto' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        <Box>Are you sure you want to delete this delegate?</Box>

        {error && (
          <Box mt={2}>
            <ErrorMessage error={error}>Error deleting delegate</ErrorMessage>
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
          onClick={onConfirm}
          disabled={isLoading}
          sx={{ minWidth: '122px', minHeight: '36px' }}
        >
          {isLoading ? <CircularProgress size={20} /> : 'Yes, delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const DeleteProposer = madProps(_DeleteProposer, {
  wallet: useWallet,
  chainId: useChainId,
  safeAddress: useSafeAddress,
})

export default DeleteProposer
