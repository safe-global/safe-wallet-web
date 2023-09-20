import { ChangeEvent, useContext, useState } from 'react'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import SessionForm from '../SessionForm'

const WalletConnectHeaderWidget = () => {
  const { walletConnect } = useContext(WalletConnectContext)
  const [error, setError] = useState<Error>()

  const onInputChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const wcUri = e.target.value

    try {
      await walletConnect.connect(wcUri)
    } catch (e) {
      setError(asError(e))
    }
  }

  return (
    <>
      {error?.message}

      <input onChange={onInputChange} placeholder="wc:" />

      <SessionForm />
    </>
  )
}

export default WalletConnectHeaderWidget
