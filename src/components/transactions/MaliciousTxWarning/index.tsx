import Tooltip from '@mui/material/Tooltip'
import SvgIcon from '@mui/material/SvgIcon'
import Box from '@mui/material/Box'
import WarningIcon from '@/public/images/notifications/warning.svg'

const MaliciousTxWarning = ({ withTooltip = true }: { withTooltip?: boolean }) => {
  return withTooltip ? (
    <Tooltip title="This token isn’t verified on major token lists and may pose risks when interacting with it or involved addresses">
      <Box
        sx={{
          lineHeight: '16px',
        }}
      >
        <SvgIcon component={WarningIcon} fontSize="small" inheritViewBox color="warning" />
      </Box>
    </Tooltip>
  ) : (
    <Box
      sx={{
        lineHeight: '16px',
      }}
    >
      <SvgIcon component={WarningIcon} fontSize="small" inheritViewBox color="warning" />
    </Box>
  )
}

export default MaliciousTxWarning
