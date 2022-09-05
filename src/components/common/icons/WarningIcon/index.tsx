import MuiWarningIcon from '@mui/icons-material/Warning'
import type { ComponentProps } from 'react'

import CircularIcon from '@/components/common/icons/CircularIcon'

const WarningIcon = (props: Pick<ComponentProps<typeof CircularIcon>, 'height' | 'width'>) => {
  return <CircularIcon component={MuiWarningIcon} alt="Not connected" color="warning" {...props} />
}

export default WarningIcon
