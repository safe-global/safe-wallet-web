import { useCallback, useContext, useEffect, useState } from 'react'
import { Button, InputAdornment, TextField } from '@mui/material'
import { WalletConnectContext } from '@/features/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import { getClipboard, isClipboardSupported } from '@/utils/clipboard'
import { isPairingUri } from '@/features/walletconnect/services/utils'
import Track from '@/components/common/Track'
import { WALLETCONNECT_EVENTS } from '@/services/analytics/events/walletconnect'
import { trackEvent } from '@/services/analytics'
import useDebounce from '@/hooks/useDebounce'

const useTrackErrors = (error?: Error) => {
  const debouncedErrorMessage = useDebounce(error?.message, 1000)

  // Track errors
  useEffect(() => {
    if (debouncedErrorMessage) {
      trackEvent({ ...WALLETCONNECT_EVENTS.SHOW_ERROR, label: debouncedErrorMessage })
    }
  }, [debouncedErrorMessage])
}

const WcInput = ({ uri }: { uri: string }) => {
  const { walletConnect } = useContext(WalletConnectContext)
  const [value, setValue] = useState('')
  const [error, setError] = useState<Error>()
  const [connecting, setConnecting] = useState(false)
  useTrackErrors(error)

  const onInput = useCallback(
    async (val: string) => {
      if (!walletConnect) return

      setValue(val)

      if (val && !isPairingUri(val)) {
        setError(new Error('Invalid pairing code'))
        return
      }

      setError(undefined)

      if (!val) return

      setConnecting(true)

      try {
        await walletConnect.connect(val)
      } catch (e) {
        setError(asError(e))
      }

      setConnecting(false)
    },
    [walletConnect],
  )

  // Insert a pre-filled uri
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
      autoFocus
      disabled={connecting}
      error={!!error}
      label={error ? error.message : 'Pairing code'}
      placeholder="wc:"
      spellCheck={false}
      InputProps={{
        autoComplete: 'off',
        endAdornment: isClipboardSupported() ? undefined : (
          <InputAdornment position="end">
            <Track {...WALLETCONNECT_EVENTS.PASTE_CLICK}>
              <Button variant="contained" onClick={onPaste} sx={{ py: 1 }} disabled={connecting}>
                Paste
              </Button>
            </Track>
          </InputAdornment>
        ),
      }}
    />
  )
}

export default WcInput
