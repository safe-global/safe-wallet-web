import { useCallback, useContext, useEffect, useState } from 'react'
import { Button, InputAdornment, TextField } from '@mui/material'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import { getClipboard, isClipboardSupported } from '@/utils/clipboard'
import { isPairingUri } from '@/services/walletconnect/utils'

const WcInput = ({ uri }: { uri: string }) => {
  const { walletConnect } = useContext(WalletConnectContext)
  const [value, setValue] = useState('')
  const [error, setError] = useState<Error>()
  const [connecting, setConnecting] = useState(false)

  const onInput = useCallback(
    async (val: string) => {
      if (!walletConnect) return

      setValue(val)
      setError(undefined)

      if (!val) return

      setConnecting(true)

      try {
        await walletConnect.connect(val)
      } catch (e) {
        setError(asError(e))
      }

      setValue('')
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

    if (clipboard && isPairingUri(clipboard)) {
      onInput(clipboard)
    }
  }, [onInput])

  return (
    <TextField
      value={value}
      onChange={(e) => onInput(e.target.value)}
      fullWidth
      autoComplete="off"
      disabled={connecting}
      error={!!error}
      label={error ? error.message : 'Pairing code'}
      placeholder="wc:"
      InputProps={{
        endAdornment: isClipboardSupported() ? undefined : (
          <InputAdornment position="end">
            <Button variant="contained" onClick={onPaste} sx={{ py: 0.8 }} disabled={connecting}>
              Paste
            </Button>
          </InputAdornment>
        ),
      }}
    />
  )
}

export default WcInput
