import { useCallback, useContext, useEffect, useState } from 'react'
import { Button, InputAdornment, TextField } from '@mui/material'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import { getClipboard, isPastingSupported } from '@/utils/clipboard'

const WcInput = ({ uri, disabled = false }: { uri: string; disabled?: boolean }) => {
  const { walletConnect } = useContext(WalletConnectContext)
  const [value, setValue] = useState('')
  const [error, setError] = useState<Error>()
  const [connecting, setConnecting] = useState(false)

  const onInput = useCallback(
    async (uri: string) => {
      if (!walletConnect) return

      setValue(uri)

      if (!uri) {
        setError(undefined)
        return
      }

      setConnecting(true)

      try {
        await walletConnect.connect(uri)
      } catch (e) {
        setError(asError(e))
      }

      setConnecting(false)
    },
    [walletConnect],
  )

  useEffect(() => {
    onInput(uri)
  }, [onInput, uri])

  const onPaste = useCallback(async () => {
    // Errors are handled by in getClipboard
    const clipboard = await getClipboard()

    if (clipboard) {
      onInput(clipboard)
    }
  }, [onInput])

  return (
    <TextField
      value={value}
      onChange={(e) => onInput(e.target.value)}
      fullWidth
      autoComplete="off"
      disabled={connecting || !disabled}
      error={!!error}
      label={error ? error.message : 'Pairing code'}
      placeholder="wc:"
      InputProps={{
        endAdornment: isPastingSupported() ? undefined : (
          <InputAdornment position="end">
            <Button variant="contained" onClick={onPaste} sx={{ py: 0.8 }}>
              Paste
            </Button>
          </InputAdornment>
        ),
      }}
    />
  )
}

export default WcInput
