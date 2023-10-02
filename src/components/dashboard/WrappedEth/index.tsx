import { type ReactElement, useContext } from 'react'
import { Box, Button, TextField, Typography } from '@mui/material'
import { Card, WidgetBody, WidgetContainer } from '../styled'
import SafeAppsTxFlow from '@/components/tx-flow/flows/SafeAppsTx'
import { TxModalContext } from '@/components/tx-flow'

const WrappedEth = (): ReactElement => {
  const { setTxFlow } = useContext(TxModalContext)

  const onTxSubmit = (tx: { to: string; value: string; data: string }) => {
    setTxFlow(
      <SafeAppsTxFlow
        data={{
          requestId: Math.random().toString(36).slice(2),
          txs: [tx],
          params: { safeTxGas: 0 },
          app: {
            name: 'Wrapped ETH',
            iconUrl: 'https://s2.coinmarketcap.com/static/img/coins/64x64/2396.png',
          },
        }}
      />,
    )
  }

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
