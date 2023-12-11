import { parsePrefixedAddress } from '@/utils/addresses'
import { Close } from '@mui/icons-material'
import {
  Dialog,
  DialogTitle,
  SvgIcon,
  Typography,
  IconButton,
  Divider,
  DialogContent,
  DialogActions,
  Button,
  Box,
} from '@mui/material'
import WarningIcon from '@/public/images/notifications/warning.svg'
import EthHashInfo from '../EthHashInfo'
import type { CopyTooltipConfirmationModalProps } from '../CopyTooltip'

const CopyUntrustedAddressModal = ({ open, onClose, onCopy, text }: CopyTooltipConfirmationModalProps) => {
  const { address } = parsePrefixedAddress(text)
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
          <SvgIcon component={WarningIcon} inheritViewBox color="warning" sx={{ mb: -0.4 }} />
          <Typography variant="h6" fontWeight={700}>
            Before you copy
          </Typography>
          <IconButton onClick={onClose} sx={{ marginLeft: 'auto' }}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <Divider />
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <EthHashInfo address={address} shortAddress={false} copyAddress={false} showCopyButton={false} hasExplorer />
          <Typography>
            The copied address is linked to a transaction with an untrusted token. Make sure you are interacting with
            the right address.
          </Typography>
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions sx={{ padding: 3 }}>
        <Button size="small" variant="outlined" color="secondary" onClick={onCopy}>
          Proceed and copy
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CopyUntrustedAddressModal
