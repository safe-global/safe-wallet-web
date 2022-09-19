import { IconButton, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import usePairingUri from '@/services/pairing/hooks'
import QRCode from '@/components/common/QRCode'
import PairingDescription from './PairingDescription'
import { getPairingConnector, usePairingConnector, WalletConnectEvents } from '@/services/pairing/connector'
import useChainId from '@/hooks/useChainId'
import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import RefreshIcon from '@mui/icons-material/Refresh'

const QR_CODE_SIZE = 100

const PairingDetails = ({ vertical = false }: { vertical?: boolean }): ReactElement => {
  const [displayRefresh, setDisplayRefresh] = useState<boolean>(false)
  const chainId = useChainId()
  const uri = usePairingUri()
  const connector = usePairingConnector()

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

  const title = <Typography variant="h5">Connect to mobile</Typography>

  const qr =
    displayRefresh || (connector && !connector.handshakeTopic) ? (
      <Box
        sx={{
          width: 100,
          height: 100,
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
    ) : (
      <QRCode value={uri} size={QR_CODE_SIZE} />
    )

  const description = <PairingDescription />

  return (
    <>
      {vertical ? (
        <>
          {title}
          {qr}
          {description}
        </>
      ) : (
        <>
          {qr}
          <div>
            {title}
            {description}
          </div>
        </>
      )}
    </>
  )
}

export default PairingDetails
