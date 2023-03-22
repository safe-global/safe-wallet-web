import Footer from '@/components/relaying-educational/Footer'
import { type StepRenderProps } from '@/components/relaying-educational/RelaySeriesStepper/useEducationSeriesStepper'
import { Box } from '@mui/material'

const WhatIsRelaying = ({ onNext }: Partial<StepRenderProps>) => {
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
      <Footer next={{ label: 'Next', cb: onNext }} justifyContent="flex-end" />
    </Box>
  )
}

export default WhatIsRelaying
