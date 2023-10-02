import { Box, Button, TextField, Typography } from '@mui/material'
import { Card, WidgetBody, WidgetContainer } from '../styled'
import useSafeTransactionFlow from './useSafeTransactionFlow'

const WrappedEth = () => {
  const onTxSubmit = useSafeTransactionFlow()

  return (
    <WidgetContainer>
      <Typography component="h2" variant="subtitle1" fontWeight={700} mb={2}>
        Wrapped ETH
      </Typography>

      <WidgetBody>
        <Card>
          <Typography component="h3" variant="subtitle1" fontWeight={700} mb={1}>
            Your ETH balance is ...
          </Typography>

          {/* Wrap ETH */}
          <Box display="flex" mb={3} gap={2}>
            <TextField label="Amount" />

            <Button variant="contained">Wrap</Button>
          </Box>

          <Typography component="h3" variant="subtitle1" fontWeight={700} mb={1}>
            Your WETH balance is ...
          </Typography>

          {/* Unwrap ETH */}
          <Box display="flex" gap={2}>
            <TextField label="Amount" />

            <Button variant="contained">Unwrap</Button>
          </Box>
        </Card>
      </WidgetBody>
    </WidgetContainer>
  )
}

export default WrappedEth
