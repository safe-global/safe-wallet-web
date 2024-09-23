import { Typography, Chip as MuiChip } from '@mui/material'

type ChipProps = {
  label?: string
  color?: 'primary' | 'secondary' | 'info' | 'warning' | 'success' | 'error'
}

export function Chip({ color = 'primary', label = 'New' }: ChipProps) {
  return (
    <MuiChip
      size="small"
      component="span"
      sx={{
        backgroundColor: `${color}.background`,
        color: `${color}.light`,
        mt: '-2px',
      }}
      label={
        <Typography
          variant="caption"
          fontWeight="bold"
          display="flex"
          alignItems="center"
          gap={1}
          letterSpacing="1px"
          component="span"
        >
          {label}
        </Typography>
      }
    />
  )
}
