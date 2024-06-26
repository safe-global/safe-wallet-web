import { Tooltip, SvgIcon, Box } from '@mui/material'
import WarningIcon from '@/public/images/notifications/warning.svg'

const MaliciousTxWarning = ({ withTooltip = true }: { withTooltip?: boolean }) => {
  return withTooltip ? (
    <Tooltip title="This token is unfamiliar and may pose risks when interacting with it or involved addresses">
      <Box lineHeight="16px">
        <SvgIcon component={WarningIcon} fontSize="small" inheritViewBox color="warning" />
      </Box>
    </Tooltip>
  ) : (
    <Box lineHeight="16px">
      <SvgIcon component={WarningIcon} fontSize="small" inheritViewBox color="warning" />
    </Box>
  )
}

export default MaliciousTxWarning
