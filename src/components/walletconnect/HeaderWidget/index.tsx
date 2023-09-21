import { ChangeEvent, useContext, useRef, useState } from 'react'
import { Box, Input } from '@mui/material'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import SessionForm from '../SessionForm'
import Popup from '../Popup'
import Icon from './Icon'

const isWalletConnectUrl = (text: string) => text.startsWith('wc:')

const WalletConnectHeaderWidget = () => {
  const { walletConnect } = useContext(WalletConnectContext)
  const [error, setError] = useState<Error>()
  const [popupOpen, setPopupOpen] = useState(false)
  const iconRef = useRef<HTMLButtonElement>(null)

  const onInput = async (e: ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value

    if (isWalletConnectUrl(text)) {
      try {
        await walletConnect.connect(text)
      } catch (e) {
        setError(asError(error))
      }
    }
  }

  const onClick = async () => {
    setPopupOpen(true)
  }

  return (
    <Box display="flex">
      <Icon onClick={onClick} ref={iconRef} />

      <Popup anchorEl={iconRef.current} open={popupOpen} setOpen={setPopupOpen}>
        {error?.message}

        <Input onChange={onInput} placeholder="wc:" fullWidth />

        <SessionForm />
      </Popup>
    </Box>
  )
}

export default WalletConnectHeaderWidget
