import React, { type ReactElement } from 'react'
import { Stack, SvgIcon, Typography } from '@mui/material'
import type { StackProps } from '@mui/material/Stack'
import SpeedIcon from '@/public/images/settings/spending-limit/speed.svg'

const SpendingLimitLabel = ({
  label,
  isOneTime = false,
  ...rest
}: { label: string | ReactElement; isOneTime?: boolean } & StackProps) => {
  return (
    <Stack alignItems="center" spacing="4px" {...rest}>
      {!isOneTime && <SvgIcon component={SpeedIcon} inheritViewBox color="border" fontSize="medium" />}
      {typeof label === 'string' ? <Typography>{label}</Typography> : label}
    </Stack>
  )
}

export default SpendingLimitLabel
