import { type SyntheticEvent } from 'react'
import { Box, Button, SvgIcon, Tooltip } from '@mui/material'
import PlusIcon from '@/public/images/common/plus.svg'
import Track from '@/components/common/Track'
import { BATCH_EVENTS } from '@/services/analytics'

const BatchButton = ({
  onClick,
  disabled,
  tooltip,
}: {
  onClick: (e: SyntheticEvent) => void
  disabled?: boolean
  tooltip?: string
}) => (
  <>
    <Tooltip title={tooltip} placement="top">
      <span>
        <Track {...BATCH_EVENTS.BATCH_APPEND}>
          <Button variant="outlined" onClick={onClick} disabled={disabled} sx={{ display: ['none', 'flex'] }}>
            <SvgIcon component={PlusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
            Add to batch
          </Button>
        </Track>
      </span>
    </Tooltip>
    <Box display={['none', 'flex']} flexDirection="column" justifyContent="center" color="border.main">
      {' '}
      or
    </Box>
  </>
)

export default BatchButton
