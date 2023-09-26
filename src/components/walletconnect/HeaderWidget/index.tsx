import { useCallback, useContext, useRef, useState } from 'react'
import { Badge, Box } from '@mui/material'

import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'
import Icon from './Icon'
import SessionManager from '../SessionManager'
import Popup from '../Popup'

const WalletConnectHeaderWidget = () => {
  const { error } = useContext(WalletConnectContext)
  const [popupOpen, setPopupOpen] = useState(false)
  const iconRef = useRef<HTMLDivElement>(null)
  const onOpen = useCallback(() => setPopupOpen(true), [])
  const onClose = useCallback(() => setPopupOpen(false), [])

  return (
    <Box display="flex">
      <div ref={iconRef}>
        <Icon onClick={onOpen} />
        <Badge color="error" variant="dot" invisible={!error} />
      </div>

      <Popup anchorEl={iconRef.current} open={popupOpen} onClose={onClose}>
        <SessionManager />
      </Popup>
    </Box>
  )
}

export default WalletConnectHeaderWidget
