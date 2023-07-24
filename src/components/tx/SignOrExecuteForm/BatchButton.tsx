import { type SyntheticEvent } from 'react'
import { Box, Button, SvgIcon } from '@mui/material'
import PlusIcon from '@/public/images/common/plus.svg'
import Track from '@/components/common/Track'
import { BATCH_EVENTS } from '@/services/analytics'

const BatchButton = ({ onClick, disabled }: { onClick: (e: SyntheticEvent) => void; disabled?: boolean }) => (
  <>
    <Track {...BATCH_EVENTS.BATCH_APPEND}>
      <Button variant="outlined" onClick={onClick} disabled={disabled}>
        <SvgIcon component={PlusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
        Add to batch
      </Button>
    </Track>

    <Box display="flex" flexDirection="column" justifyContent="center" color="border.main">
      or
    </Box>
  </>
)

export default BatchButton
