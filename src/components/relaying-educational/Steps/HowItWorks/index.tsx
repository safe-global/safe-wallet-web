import Footer from '@/components/relaying-educational/Footer'
import { type StepRenderProps } from '@/components/relaying-educational/RelaySeriesStepper/useEducationSeriesStepper'
import { Box, Typography } from '@mui/material'

const HowItWorks = ({ onBack, onNext }: Partial<StepRenderProps>) => {
  return (
    <Box>
      <Typography fontWeight={700}>Which networks are supported</Typography>
      <Typography mb={3}>Gnosis Chain</Typography>
      <Typography fontWeight={700}>Do I have to pay for the service?</Typography>
      <Typography mb={3}>
        Our partner Gnosis Chain will temporarily sponsor your transactions via as the first test version. In the next
        iteration, a fee will be charged for the service.
        <br />
        <br />
        You can still choose to execute with your connected wallet/owner keys if you don&apos;t want to use the relaying
        service.
      </Typography>
      <Typography fontWeight={700}>How often can I relay?</Typography>
      <Typography mb={5}>
        In the pilot phase we pay your transaction fees until your transaction limit of five transactions per hour is
        reached. After that threshold is reached, if you intend to transact on the chain you need to use a connected
        owner key or wait until the next one hour window opens up for you.
      </Typography>

      <Footer back={{ label: 'Back', cb: onBack }} next={{ label: 'Next', cb: onNext }} />
    </Box>
  )
}

export default HowItWorks
