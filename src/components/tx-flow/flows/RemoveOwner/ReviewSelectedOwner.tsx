import { Typography, Button, CardActions } from '@mui/material'

import EthHashInfo from '@/components/common/EthHashInfo'
import type { RemoveOwnerFlowProps } from '.'
import TxCard from '../../common/TxCard'

export const ReviewSelectedOwner = ({ params, onSubmit }: { params: RemoveOwnerFlowProps; onSubmit: () => void }) => {
  return (
    <TxCard>
      <form onSubmit={onSubmit}>
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

        <CardActions>
          <Button variant="contained" type="submit">
            Next
          </Button>
        </CardActions>
      </form>
    </TxCard>
  )
}
