import React, { type ReactElement } from 'react'
import { Box, Typography } from '@mui/material'
import SpeedIcon from '@mui/icons-material/Speed'
import type { BoxProps } from '@mui/system'

const SpendingLimitLabel = ({
  label,
  isOneTime = false,
  ...rest
}: { label: string | ReactElement; isOneTime?: boolean } & BoxProps) => {
  return (
    <Box display="flex" alignItems="center" gap="4px" {...rest}>
      {!isOneTime && <SpeedIcon sx={({ palette }) => ({ color: palette.border.main })} />}
      {typeof label === 'string' ? <Typography variant="body2">{label}</Typography> : label}
    </Box>
  )
}

export default SpendingLimitLabel
