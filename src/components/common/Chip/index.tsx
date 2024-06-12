import { Chip as MuiChip } from '@mui/material'
import type { ChipProps } from '@mui/material'
import type { ReactElement } from 'react'
import React from 'react'

export function Chip(props: ChipProps): ReactElement {
  return <MuiChip label="New" color="success" size="small" sx={{ fontSize: '11px', fontWeight: 'bold' }} {...props} />
}
