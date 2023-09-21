import { Box, Input } from '@mui/material'
import { useContext, useState } from 'react'
import type { ChangeEvent, MouseEvent } from 'react'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import { asError } from '@/services/exceptions/utils'
import SessionForm from '../SessionForm'
import Popup from '../Popup'
import Icon from './Icon'

const isWalletConnectUrl = (text: string) => text.startsWith('wc:')

const WalletConnectHeaderWidget = () => {
  const { walletConnect } = useContext(WalletConnectContext)
  const [error, setError] = useState<Error>()
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)

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

  const onClick = (event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }

  return (
    <Box display="flex">
      <Icon onClick={onClick} />

      <Popup anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
        {error?.message}

        <Input onChange={onInput} placeholder="wc:" fullWidth />

        <SessionForm anchorEl={anchorEl} />
      </Popup>
    </Box>
  )
}

export default WalletConnectHeaderWidget
