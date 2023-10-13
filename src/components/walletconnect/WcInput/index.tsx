import { useCallback, useContext, useEffect, useState } from 'react'
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

  const getClipboard = useCallback(async () => {
    let clipboard: string | null = null

    try {
      clipboard = await navigator.clipboard.readText()
    } catch (e) {
      setError(asError(e))
      return
    }

    return clipboard
  }, [])

  const onPaste = useCallback(async () => {
    const clipboard = await getClipboard()

    if (clipboard) {
      onInput(clipboard)
    }
  }, [getClipboard, onInput])

  useEffect(() => {
    if (!navigator || !window) {
      return
    }

    const autofillUri = async () => {
      let isGranted = false

      try {
        // @ts-expect-error navigator permissions types don't include clipboard
        const permission = await navigator.permissions.query({ name: 'clipboard-read' })
        isGranted = permission.state === 'granted'
      } catch (e) {
        setError(asError(e))
        return
      }

      if (!isGranted) {
        return
      }

      const clipboard = await getClipboard()

      if (clipboard?.startsWith('wc:')) {
        onInput(clipboard)
      }
    }

    window.addEventListener('focus', autofillUri)

    return () => {
      window.removeEventListener('focus', autofillUri)
    }
  }, [getClipboard, onInput])

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
