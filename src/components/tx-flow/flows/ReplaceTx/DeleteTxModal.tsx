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
} from '@mui/material'
import { Close } from '@mui/icons-material'
import madProps from '@/utils/mad-props'
import useOnboard from '@/hooks/wallets/useOnboard'
import useChainId from '@/hooks/useChainId'
import useSafeAddress from '@/hooks/useSafeAddress'
import { deleteTx } from '@/utils/gateway'
import { getAssertedChainSigner } from '@/services/tx/tx-sender/sdk'
import { useState } from 'react'

type DeleteTxModalProps = {
  safeTxHash: string
  onClose: () => void
  onboard: ReturnType<typeof useOnboard>
  chainId: ReturnType<typeof useChainId>
  safeAddress: ReturnType<typeof useSafeAddress>
}

const _DeleteTxModal = ({ safeTxHash, onClose, onboard, safeAddress, chainId }: DeleteTxModalProps) => {
  const [error, setError] = useState<Error>()

  const onConfirm = async () => {
    setError(undefined)

    if (!onboard || !safeAddress || !chainId || !safeTxHash) {
      setError(new Error('Please connect your wallet first'))
      return
    }

    try {
      const signer = await getAssertedChainSigner(onboard, chainId)

      await deleteTx({
        safeTxHash,
        safeAddress,
        chainId,
        signer,
      })
    } catch (error) {
      setError(error as Error)
    }
  }

  return (
    <Dialog open onClose={onClose}>
      <DialogTitle>
        <Box data-testid="untrusted-token-warning" display="flex" flexDirection="row" alignItems="center" gap={1}>
          <Typography variant="h6" fontWeight={700}>
            Confirm deletion
          </Typography>
          <IconButton aria-label="close" onClick={onClose} sx={{ marginLeft: 'auto' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent>
        Are you sure? Beware of risks.
        {error && <Typography color="error">{error.message}</Typography>}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ padding: 3 }}>
        <Button size="small" variant="contained" color="primary" onClick={onConfirm}>
          Yes, delete
        </Button>
      </DialogActions>
    </Dialog>
  )
}

const DeleteTxModal = madProps(_DeleteTxModal, {
  onboard: useOnboard,
  chainId: useChainId,
  safeAddress: useSafeAddress,
})

export default DeleteTxModal
