import { Typography } from '@mui/material'
import { useContext } from 'react'
import { SafeTxContext } from '../SafeTxProvider'

const TxNonce = () => {
  const { safeTx, recommendedNonce } = useContext(SafeTxContext)

  const nonce = safeTx?.data.nonce ?? recommendedNonce

  if (nonce === undefined) return null

  return (
    <Typography variant="h4" fontWeight={700}>
      #{nonce}
    </Typography>
  )
}

export default TxNonce
