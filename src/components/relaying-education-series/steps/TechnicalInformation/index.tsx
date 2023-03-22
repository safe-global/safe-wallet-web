import Footer from '@/components/relaying-education-series/Footer'
import { type StepRenderProps } from '@/components/relaying-education-series/RelaySeriesStepper/useEducationSeriesStepper'
import { Box } from '@mui/material'

const TechnicalInformation = ({ onBack, onClose }: Partial<StepRenderProps>) => {
  return (
    <Box>
      <p>
        We are routing your transaction via our Safe internal Relay service to the Gelato API. From here Gelato’s
        internal systems are responsible to process your transaction.
      </p>
      <p>
        Safe is using Gelato’s 1Balance service which means that Safe funds a Safe 1Balance account with USDC on Polygon
        out of which all network fees and the Gelato fee for using the relaying service are paid from. If you want to
        dive into the technical details of the implementation you can find the documentation here xyz.
      </p>

      <img src="/images/common/relayer-flow.png" alt="relayer flow" width="100%" />

      <Footer
        back={{ label: 'Back', cb: onBack }}
        next={{ label: 'Done', cb: onClose }}
        justifyContent="space-between"
      />
    </Box>
  )
}

export default TechnicalInformation
