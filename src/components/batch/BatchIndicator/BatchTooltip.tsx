import { type ReactElement, useEffect, useState } from 'react'
import { Box, SvgIcon } from '@mui/material'
import Tooltip, { type TooltipProps, tooltipClasses } from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import SuccessIcon from '@/public/images/common/success.svg'
import { TxEvent, txSubscribe } from '@/services/tx/txEvents'

const StyledTooltip = styled(({ className, ...props }: TooltipProps) => (
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

const BatchTooltip = ({ children }: { children: ReactElement }) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false)

  // Click outside to close the tooltip
  useEffect(() => {
    const handleClickOutside = () => setShowTooltip(false)
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [])

  // Show tooltip when tx is added to batch
  useEffect(() => {
    return txSubscribe(TxEvent.BATCH_ADD, () => setShowTooltip(true))
  }, [])

  return (
    <StyledTooltip
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
      <div>{children}</div>
    </StyledTooltip>
  )
}

export default BatchTooltip
