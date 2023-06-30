import Icon from '@web3-onboard/walletconnect/dist/icon'
import { IconButton, Popover } from '@mui/material'
import { useState } from 'react'
import type { ReactElement } from 'react'
import type { SafeAppData } from '@safe-global/safe-gateway-typescript-sdk'

import { getOrigin } from '@/components/safe-apps/utils'
import { useRemoteSafeApps } from '@/hooks/safe-apps/useRemoteSafeApps'
import { useBrowserPermissions } from '@/hooks/safe-apps/permissions'
import AppFrame from '@/components/safe-apps/AppFrame'
import WalletIcon from '@/components/common/WalletIcon'

const NAME = 'WalletConnect'
const appUrl = 'https://safe-apps.dev.5afe.dev/wallet-connect'

const WalletConnectModal = ({ app }: { app: SafeAppData }): ReactElement => {
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null)
  const { getAllowedFeaturesList } = useBrowserPermissions()

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <WalletIcon provider={NAME} icon={Icon} />
      </IconButton>
      <Popover
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        keepMounted // We must keep the modal mounted to maintain connection
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        sx={{ marginTop: 1, '> div > div': { height: '600px' }, '& .MuiPaper-root': { width: '500px' } }}
      >
        <AppFrame appUrl={appUrl} allowedFeaturesList={getAllowedFeaturesList(getOrigin(app.url))} />
      </Popover>
    </>
  )
}

export const WalletConnect = () => {
  const [safeApps] = useRemoteSafeApps()
  const app = safeApps?.find((app) => app.name === NAME)

  if (!app) {
    return null
  }

  return <WalletConnectModal app={app} />
}
