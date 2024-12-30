import { Tooltip, Typography } from '@mui/material'
import type { TransactionDetails } from '@safe-global/safe-gateway-typescript-sdk'
import InfoIcon from '@/public/images/notifications/info.svg'

const TxNote = ({ txDetails }: { txDetails: TransactionDetails | undefined }) => {
  const note = (txDetails as TransactionDetails & { note: string | null })?.note

  return note ? (
    <div>
      <Typography variant="h5" display="flex" alignItems="center" justifyItems="center">
        Note
        <Tooltip title="This note is left by the transaction creator." arrow>
          <Typography color="text.secondary" component="span" height="1em">
            <InfoIcon height="1em" />
          </Typography>
        </Tooltip>
      </Typography>

      <Typography p={2} mt={1} borderRadius={1} bgcolor="background.main">
        {note}
      </Typography>
    </div>
  ) : null
}

export default TxNote
