import { SvgIcon, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import WalletConnect from '@/public/images/common/walletconnect.svg'

export const WalletConnectHeader = ({ error }: { error?: boolean }): ReactElement => {
  return (
    <>
      <SvgIcon
        component={WalletConnect}
        inheritViewBox
        sx={{
          color: error ? '#FF5F72' : '#3A99FB',
          width: '40px',
        }}
      />

      <Typography variant="h5" mt={2} mb={0.5}>
        Safe via WalletConnect
      </Typography>
    </>
  )
}
