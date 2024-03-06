import Track from '@/components/common/Track'
import { useDraftBatch } from '@/hooks/useDraftBatch'
import BatchIcon from '@/public/images/common/batch.svg'
import { BATCH_EVENTS } from '@/services/analytics'
import { Badge, ButtonBase, SvgIcon } from '@mui/material'
import BatchTooltip from './BatchTooltip'

const BatchIndicator = ({ onClick }: { onClick?: () => void }) => {
  const { length } = useDraftBatch()

  return (
    <BatchTooltip>
      <Track {...BATCH_EVENTS.BATCH_SIDEBAR_OPEN} label={length}>
        <ButtonBase data-sid="31279" title="Batch" onClick={onClick} sx={{ p: 2 }}>
          <Badge
            variant="standard"
            badgeContent={length}
            color={'secondary'}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <SvgIcon component={BatchIcon} inheritViewBox fontSize="medium" />
          </Badge>
        </ButtonBase>
      </Track>
    </BatchTooltip>
  )
}

export default BatchIndicator
