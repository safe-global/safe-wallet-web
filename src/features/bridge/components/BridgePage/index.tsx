import { Box, Stack } from '@mui/material'
import BridgingWidget from '../BridgingWidget'

const BridgePage = () => {
  return (
    <>
      <Stack direction="column" flexGrow={1} justifyContent="center">
        <Box>
          <BridgingWidget />
        </Box>
      </Stack>
    </>
  )
}

export default BridgePage
