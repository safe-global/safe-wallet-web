import { styled } from '@mui/material/styles'
import Tooltip, { tooltipClasses } from '@mui/material/Tooltip'
import { type TooltipProps } from '@mui/material/Tooltip'

export const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} classes={{ popper: className }} arrow />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    fontSize: theme.typography.pxToRem(16),
    fontWeight: 700,
    border: `1px solid ${theme.palette.border.light}`,
    marginTop: theme.spacing(2) + ' !important',
  },
  [`& .${tooltipClasses.arrow}`]: {
    color: theme.palette.background.paper,
  },
  [`& .${tooltipClasses.arrow}:before`]: {
    border: `1px solid ${theme.palette.border.light}`,
  },
}))
