import { Badge, Box } from '@mui/material'
import { useContext, useRef, useState } from 'react'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import Icon from './Icon'
import SessionManager from '../SessionManager'
import Popup from '../Popup'

const WalletConnectHeaderWidget = () => {
  const { error } = useContext(WalletConnectContext)
  const [popupOpen, setPopupOpen] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)

  const onClick = () => {
    setPopupOpen(true)
  }

  return (
    <Box display="flex">
      <div ref={iconRef}>
        <Icon onClick={onClick} />
        <Badge color="error" variant="dot" invisible={!error} />
      </div>

      <Popup anchorEl={iconRef.current} open={popupOpen} onClose={() => setPopupOpen(false)}>
        <SessionManager />
      </Popup>
    </Box>
  )
}

export default WalletConnectHeaderWidget
