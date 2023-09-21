import { Box } from '@mui/material'
import { useContext, useRef, useState } from 'react'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import Popup from '../Popup'
import Icon from './Icon'
import SessionManager from '../SessionManager'

const WalletConnectHeaderWidget = () => {
  const { walletConnect } = useContext(WalletConnectContext)
  const [popupOpen, setPopupOpen] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)

  const onClick = () => {
    setPopupOpen(true)
  }

  return (
    <Box display="flex">
      <div ref={iconRef}>
        <Icon onClick={onClick} />
      </div>

      <Popup anchorEl={iconRef.current} open={popupOpen} onClose={() => setPopupOpen(false)}>
        <SessionManager />
      </Popup>
    </Box>
  )
}

export default WalletConnectHeaderWidget
