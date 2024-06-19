import { Tooltip, SvgIcon, Box } from '@mui/material'
import Warning from '@/public/images/notifications/warning.svg'

const WarningIcon = () => {
  return (
    <Box lineHeight="16px">
      <SvgIcon component={Warning} fontSize="small" inheritViewBox color="warning" />
    </Box>
  )
}

const MaliciousTxWarning = ({ withTooltip = true }: { withTooltip?: boolean }) => {
  return withTooltip ? (
    <Tooltip title="This token is unfamiliar and may pose risks when interacting with it or involved addresses">
      <WarningIcon />
    </Tooltip>
  ) : (
    <WarningIcon />
  )
}

export default MaliciousTxWarning
