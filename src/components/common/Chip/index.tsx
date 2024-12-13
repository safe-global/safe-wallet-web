import { Chip as MuiChip } from '@mui/material'
import type { ChipProps } from '@mui/material'
import type { ReactElement } from 'react'

import { useDarkMode } from '@/hooks/useDarkMode'

export function Chip(props: ChipProps): ReactElement {
  const isDarkMode = useDarkMode()
  return (
    <MuiChip
      label="New"
      color={isDarkMode ? 'primary' : 'secondary'}
      size="small"
      sx={{ borderRadius: '4px', fontSize: '12px' }}
      {...props}
    />
  )
}
