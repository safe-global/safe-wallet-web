import { DialogContent, Typography, Button, DialogActions } from '@mui/material'

import EthHashInfo from '@/components/common/EthHashInfo'
import type { RemoveOwnerFlowProps } from '.'

export const ReviewSelectedOwner = ({ params, onSubmit }: { params: RemoveOwnerFlowProps; onSubmit: () => void }) => {
  return (
    <form onSubmit={onSubmit}>
      <DialogContent>
        <Typography mb={2}>Review the owner you want to remove from the active Safe Account:</Typography>
        <EthHashInfo
          address={params.removedOwner.address}
          name={params.removedOwner.name}
          showName
          shortAddress={false}
          showCopyButton
          hasExplorer
          showAvatar
        />
      </DialogContent>

      <DialogActions>
        <Button variant="contained" type="submit">
          Next
        </Button>
      </DialogActions>
    </form>
  )
}
