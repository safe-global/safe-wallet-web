import { Typography, Chip as MuiChip, type ChipProps } from '@mui/material'

type Props = {
  label?: string
  sx?: ChipProps['sx']
}

export function Chip({ sx, label = 'New' }: Props) {
  return (
    <MuiChip
      size="small"
      component="span"
      sx={{
        ...sx,
        mt: '-2px',
      }}
      label={
        <Typography
          variant="caption"
          component="span"
          sx={{
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            letterSpacing: '1px',
          }}
        >
          {label}
        </Typography>
      }
    />
  )
}
