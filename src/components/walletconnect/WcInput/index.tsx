import { Input } from '@mui/material'
import { useContext, useState } from 'react'
import type { ChangeEvent } from 'react'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'

const WcInput = () => {
  const { walletConnect } = useContext(WalletConnectContext)
  const [error, setError] = useState<Error>()
  const [connecting, setConnecting] = useState(false)

  const onInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const uri = e.target.value

    try {
      await walletConnect.connect(uri)
    } catch (e) {
      setError(asError(e))
      return
    }

    setConnecting(true)
  }

  return (
    <>
      {error?.message}

      {!connecting && <Input onChange={onInput} placeholder="wc:" fullWidth inputProps={{ pattern: /^wc:/ }} />}
    </>
  )
}

export default WcInput
