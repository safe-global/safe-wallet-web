import EthHashInfo from '@/components/common/EthHashInfo'
import { Button, DialogContent, Typography } from '@mui/material'
import type { RemoveOwnerData } from '..'

export const ReviewSelectedOwnerStep = ({
  data,
  onSubmit,
}: {
  data: RemoveOwnerData
  onSubmit: (data: RemoveOwnerData) => void
}) => {
  return (
    <form onSubmit={() => onSubmit(data)}>
      <DialogContent>
        <Typography mb={2}>Review the owner you want to remove from the active Safe:</Typography>
        <EthHashInfo
          address={data.removedOwner.address}
          name={data.removedOwner.name}
          showName
          shortAddress={false}
          showCopyButton
          hasExplorer
          showAvatar
        />
        <Button variant="contained" type="submit">
          Next
        </Button>
      </DialogContent>
    </form>
  )
}
