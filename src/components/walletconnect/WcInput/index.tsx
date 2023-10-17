import { useCallback, useContext, useEffect, useState } from 'react'
import { Button, InputAdornment, TextField } from '@mui/material'
import type { ReactElement } from 'react'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import { getClipboard, isPastingSupported } from '@/utils/clipboard'

import css from '../SessionList/styles.module.css'

const WcInput = ({ uri }: { uri: string }): ReactElement => {
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
      disabled={connecting}
      error={!!error}
      label={error ? error.message : 'Pairing UI'}
      placeholder="wc:"
      InputProps={{
        endAdornment: isPastingSupported() ? undefined : (
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
