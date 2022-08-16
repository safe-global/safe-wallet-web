import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip'

const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    color: theme.palette.common.black,
    backgroundColor: theme.palette.common.white,
    borderRadius: '8px',
    boxShadow: '1px 2px 10px rgba(40, 54, 61, 0.18)',
    fontSize: '14px',
    padding: '16px',
    lineHeight: 'normal',
  },
  [`& .${tooltipClasses.arrow}`]: {
    '&::before': {
      backgroundColor: theme.palette.common.white,
      boxShadow: '1px 2px 10px rgba(40, 54, 61, 0.18)',
    },
  },
}))

export default CustomTooltip
