import { useEffect, useState } from 'react'
import { Badge, Box, ButtonBase, SvgIcon } from '@mui/material'
import Tooltip, { type TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import BatchIcon from '@/public/images/common/batch.svg'
import SuccessIcon from '@/public/images/common/success.svg'
import { useDraftBatch } from '@/hooks/useDraftBatch'
import Track from '../Track'
import { BATCH_EVENTS } from '@/services/analytics'

const BatchTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 700,
    border: '1px solid',
    borderColor: theme.palette.border.light,
    marginTop: theme.spacing(2) + ' !important',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
  [`& .${tooltipClasses.arrow}:before`]: {
    border: '1px solid',
    borderColor: theme.palette.border.light,
  },
}))

const BatchIndicator = ({ onClick }: { onClick?: () => void }) => {
  const { length } = useDraftBatch()
  const [, setPrevLength] = useState(-1)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    setPrevLength((prev) => {
      if (length > 0 && prev !== length) {
        if (prev !== -1) {
          setShowTooltip(true)
        }
        return length
      }
      return prev
    })
    const timeout = setTimeout(() => setShowTooltip(false), 3000)
    return () => clearTimeout(timeout)
  }, [length])

  useEffect(() => {
    const handleClickOutside = () => setShowTooltip(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  const button = (
    <Track {...BATCH_EVENTS.BATCH_SIDEBAR_OPEN} label={length}>
      <ButtonBase onClick={onClick} sx={{ p: 0.5 }}>
        <Badge variant="standard" color="secondary" badgeContent={length}>
          <SvgIcon component={BatchIcon} inheritViewBox fontSize="small" />
        </Badge>
      </ButtonBase>
    </Track>
  )

  return (
    <BatchTooltip
      open={showTooltip}
      onClose={() => setShowTooltip(false)}
      arrow
      title={
        <Box display="flex" flexDirection="column" alignItems="center" p={2} gap={2}>
          <Box fontSize="53px">
            <SvgIcon component={SuccessIcon} inheritViewBox fontSize="inherit" />
          </Box>
          Transaction is added to batch
        </Box>
      }
    >
      {button}
    </BatchTooltip>
  )
}

export default BatchIndicator
