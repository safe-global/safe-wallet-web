import { Divider, Typography } from '@mui/material'
import type { ReactElement } from 'react'

import LockIcon from '@/public/images/common/lock.svg'
import SocialSigner from '@/components/common/SocialSigner'
import WalletLogin from '@/components/welcome/WelcomeLogin/WalletLogin'

const WalletDetails = ({ onConnect }: { onConnect: () => void }): ReactElement => {
  return (
    <>
      <LockIcon />

      <WalletLogin onLogin={onConnect} />

      <Divider sx={{ width: '100%' }}>
        <Typography color="text.secondary" fontWeight={700} variant="overline">
          or
        </Typography>
      </Divider>

      <SocialSigner onRequirePassword={onConnect} />
    </>
  )
}

export default WalletDetails
