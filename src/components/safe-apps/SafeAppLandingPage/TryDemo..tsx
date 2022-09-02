import { Box, Button, Typography } from '@mui/material'

const TryDemo = () => {
  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography variant="h5" sx={{ mb: 3 }} fontWeight={700}>
        Try the app before using it
      </Typography>
      <img src="/images/apps-demo.svg" alt="An icon of a internet browser" />
      <Button variant="outlined" sx={{ mt: 4, width: 186 }}>
        Try demo
      </Button>
    </Box>
  )
}

export { TryDemo }
