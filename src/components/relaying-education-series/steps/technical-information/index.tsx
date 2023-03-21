import { Box, Button } from '@mui/material'

const TechnicalInformation = () => {
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

      <Box display="flex" flexDirection="row" justifyContent="space-between" mt={5}>
        <Button variant="outlined" size="stretched" onClick={() => {}}>
          Back
        </Button>
        <Button variant="contained" size="stretched" onClick={() => {}}>
          Done
        </Button>
      </Box>
    </Box>
  )
}

export default TechnicalInformation
