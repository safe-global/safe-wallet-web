import { Typography, CircularProgress } from '@mui/material'

export const LoadingLabel = () => {
  return (
    <Typography variant="body2" color="text.secondary" display="flex" alignItems="center" gap={1} p={2}>
      <CircularProgress
        thickness={2}
        size={24}
        sx={{
          color: ({ palette }) => palette.text.secondary,
        }}
      />
      Calculating...
    </Typography>
  )
}
