import EthHashInfo from '@/components/common/EthHashInfo'
import TxModalTitle from '@/components/tx/TxModalTitle'
import { Box, Button, Typography } from '@mui/material'
import { RemoveOwnerData } from '..'

export const ReviewSelectedOwnerStep = ({
  data,
  onSubmit,
}: {
  data: RemoveOwnerData
  onSubmit: (data: RemoveOwnerData) => void
}) => {
  return (
    <form onSubmit={() => onSubmit(data)}>
      <TxModalTitle>Remove owner</TxModalTitle>
      <Box py={3}>
        <Typography mb={4}>Review the owner you want to remove from the active Safe:</Typography>
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
      </Box>
    </form>
  )
}
