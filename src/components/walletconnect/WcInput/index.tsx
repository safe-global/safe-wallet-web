import { useCallback, useContext, useState } from 'react'
import type { ChangeEvent } from 'react'
import { TextField, Typography } from '@mui/material'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'

const WcInput = () => {
  const { walletConnect } = useContext(WalletConnectContext)
  const [error, setError] = useState<Error>()
  const [connecting, setConnecting] = useState(false)

  const onInput = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      if (!walletConnect) return

      const uri = e.target.value
      if (!uri) {
        setError(undefined)
        return
      }

      try {
        await walletConnect.connect(uri)
      } catch (e) {
        setError(asError(e))
        return
      }

      setConnecting(true)
    },
    [walletConnect],
  )

  return (
    <>
      <Typography variant="h5">New connection</Typography>

      <TextField
        onChange={onInput}
        fullWidth
        autoComplete="off"
        disabled={connecting}
        error={!!error}
        label={error ? error.message : 'wc:'}
        sx={{ my: 2 }}
      ></TextField>
    </>
  )
}

export default WcInput
