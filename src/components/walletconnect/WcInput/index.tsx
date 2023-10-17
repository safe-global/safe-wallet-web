import { useCallback, useContext, useEffect, useState } from 'react'
import { Button, InputAdornment, TextField } from '@mui/material'
import type { ReactElement } from 'react'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import { getClipboard } from '@/utils/clipboard'
import useSafeInfo from '@/hooks/useSafeInfo'

import css from '../SessionList/styles.module.css'

const WcInput = ({ uri }: { uri: string }): ReactElement => {
  const { safeLoaded } = useSafeInfo()
  const { walletConnect } = useContext(WalletConnectContext)
  const [value, setValue] = useState('')
  const [error, setError] = useState<Error>()
  const [connecting, setConnecting] = useState(false)

  // readText is not supported by Firefox
  // @see https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/readText#browser_compatibility
  const isFirefox = navigator?.userAgent.includes('Firefox')

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
      disabled={connecting || !safeLoaded}
      error={!!error}
      label={error ? error.message : 'Pairing UI'}
      placeholder="wc:"
      InputProps={{
        endAdornment: isFirefox ? undefined : (
          <InputAdornment position="end">
            <Button variant="contained" onClick={onPaste} className={css.button}>
              Paste
            </Button>
          </InputAdornment>
        ),
      }}
    />
  )
}

export default WcInput
