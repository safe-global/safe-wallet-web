import { Alert, Typography } from '@mui/material'

const CounterfactualHint = () => {
  return (
    <Alert severity="info" sx={{ mt: 2 }}>
      <Typography fontWeight="bold" mb={1}>
        Create now, pay later! Only for 1/1 Accounts
      </Typography>
      Explore Safe{'{Wallet}'} without additional hassle. Pay the gas fees later at any time, and don&apos;t forget to
      add extra signers for better security.
    </Alert>
  )
}

export default CounterfactualHint
