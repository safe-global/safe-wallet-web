import { Badge, ButtonBase, SvgIcon } from '@mui/material'
import BatchIcon from '@/public/images/common/batch.svg'
import { useDraftBatch } from '@/hooks/useDraftBatch'
import Track from '@/components/common/Track'
import { BATCH_EVENTS } from '@/services/analytics'
import BatchTooltip from './BatchTooltip'
import { useDarkMode } from '@/hooks/useDarkMode'

const BatchIndicator = ({ onClick }: { onClick?: () => void }) => {
  const { length } = useDraftBatch()
  const isDarkMode = useDarkMode()

  return (
    <BatchTooltip>
      <Track {...BATCH_EVENTS.BATCH_SIDEBAR_OPEN} label={length}>
        <ButtonBase title="Batch" onClick={onClick} sx={{ p: 0.5 }}>
          <Badge
            variant="standard"
            badgeContent={length}
            color={isDarkMode ? 'primary' : 'secondary'}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
          >
            <SvgIcon component={BatchIcon} inheritViewBox fontSize="small" />
          </Badge>
        </ButtonBase>
      </Track>
    </BatchTooltip>
  )
}

export default BatchIndicator
