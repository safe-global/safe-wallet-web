import { useCallback, useContext, useState } from 'react'
import { Button, InputAdornment, TextField } from '@mui/material'
import type { ReactElement } from 'react'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'

import css from '../SessionList/styles.module.css'

const WcInput = (): ReactElement => {
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

      if (!uri) {
        setError(undefined)
        return
      }

      setValue(uri)

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

  const onPaste = useCallback(async () => {
    let clipboard: string | null = null
    try {
      clipboard = await navigator.clipboard.readText()
    } catch (e) {
      setError(asError(e))
      return
    }

    onInput(clipboard)
  }, [onInput])

  return (
    <TextField
      value={value}
      onChange={(e) => onInput(e.target.value)}
      fullWidth
      autoComplete="off"
      disabled={connecting}
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
