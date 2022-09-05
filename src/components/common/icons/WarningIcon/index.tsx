import MuiWarningIcon from '@mui/icons-material/Warning'

import CircularIcon from '@/components/common/icons/CircularIcon'

const WarningIcon = ({ size = 80 }: { size?: number }) => {
  return <CircularIcon icon={MuiWarningIcon} badgeColor="warning" size={size} />
}

export default WarningIcon
