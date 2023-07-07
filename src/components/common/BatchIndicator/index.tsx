import { Badge, ButtonBase, SvgIcon } from '@mui/material'
import BatchIcon from '@/public/images/common/batch.svg'
import { useDraftBatch } from '@/hooks/useDraftBatch'

const BatchIndicator = ({ onClick }: { onClick?: () => void }) => {
  const { length } = useDraftBatch()

  return (
    <ButtonBase onClick={onClick} sx={{ p: 0.5 }}>
      <Badge variant="standard" color="secondary" badgeContent={length}>
        <SvgIcon component={BatchIcon} inheritViewBox fontSize="small" />
      </Badge>
    </ButtonBase>
  )
}

export default BatchIndicator
