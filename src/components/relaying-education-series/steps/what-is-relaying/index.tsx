import { type StepRenderProps } from '@/components/relaying-education-series/RelaySeriesStepper/useEducationSeriesStepper'
import { Box, Button } from '@mui/material'

const WhatIsRelaying = ({ onNext, onClose }: Partial<StepRenderProps>) => {
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box>
        <p>
          Tired of handling gas limits? We’ve heard you! Transact gasless with our <strong>Relayer V1</strong> service
          with your Safe balance.
        </p>
        <p>
          We are processing your transactions via our Safe internal system to a Gelato API. From here Gelato’s internal
          systems are responsible to process your transaction.
        </p>
        <p>
          For you as Safe user relaying means we sponsor your network fees on Gnosis chain and after you executed your
          transaction it is processed by our relaying partner Gelato.
        </p>
        <p>
          I.e. no more funding of owner addresses or even distributing native assets among signer accounts because of
          zero balance, no more handling of gas limits and other cumbersome issues - meet Relayer
        </p>
      </Box>
      <Box display="flex" flexDirection="row" justifyContent="flex-end" mt={3}>
        <Button variant="contained" size="stretched" onClick={onNext}>
          Next
        </Button>
      </Box>
    </Box>
  )
}

export default WhatIsRelaying
