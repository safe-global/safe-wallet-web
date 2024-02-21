import { Alert } from '@mui/material'

const CounterfactualHint = () => {
  return (
    <Alert severity="info" sx={{ mt: 2 }}>
      Please note that Safe Accounts with more than one owner will have to be activated with a network fee right away.
      You can add more owners after Safe creation.
    </Alert>
  )
}

export default CounterfactualHint
