import SpeedIcon from '@/public/images/settings/spending-limit/speed.svg'
import { Box, SvgIcon, Typography } from '@mui/material'
import type { BoxProps } from '@mui/system'
import { type ReactElement } from 'react'

const SpendingLimitLabel = ({
  label,
  isOneTime = false,
  ...rest
}: { label: string | ReactElement; isOneTime?: boolean } & BoxProps) => {
  return (
    <Box data-sid="37579" display="flex" alignItems="center" gap="4px" {...rest}>
      {!isOneTime && <SvgIcon component={SpeedIcon} inheritViewBox color="border" fontSize="medium" />}
      {typeof label === 'string' ? <Typography>{label}</Typography> : label}
    </Box>
  )
}

export default SpendingLimitLabel
