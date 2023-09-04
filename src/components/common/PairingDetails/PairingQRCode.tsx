import { useEffect, useState } from 'react'
import { IconButton, Box } from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import type { ReactElement } from 'react'

import { getPairingConnector, usePairingConnector, WalletConnectEvents } from '@/services/pairing/connector'
import usePairingUri from '@/services/pairing/hooks'
import useChainId from '@/hooks/useChainId'
import QRCode from '@/components/common/QRCode'

const QR_CODE_SIZE = 100

const PairingQRCode = ({ size = QR_CODE_SIZE }: { size?: number }): ReactElement => {
  const chainId = useChainId()
  const uri = usePairingUri()
  const connector = usePairingConnector()
  const [displayRefresh, setDisplayRefresh] = useState<boolean>(false)

  // Workaround because the disconnect listener in useInitPairing is not picking up the event
  useEffect(() => {
    connector?.on(WalletConnectEvents.DISCONNECT, () => {
      setDisplayRefresh(true)
    })
  }, [connector])

  const handleRefresh = () => {
    setDisplayRefresh(false)
    getPairingConnector()?.createSession({ chainId: +chainId })
  }

  if (displayRefresh || (connector && !connector.handshakeTopic)) {
    return (
      <Box
        sx={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: (theme) => theme.palette.background.main,
        }}
      >
        <IconButton onClick={handleRefresh}>
          <RefreshIcon fontSize="large" />
        </IconButton>
      </Box>
    )
  }

  return <QRCode value={uri} size={size} />
}

export default PairingQRCode
