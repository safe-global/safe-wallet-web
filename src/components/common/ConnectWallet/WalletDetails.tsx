import { Box, Divider, SvgIcon, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import type { ReactElement } from 'react'

import LockIcon from '@/public/images/common/lock.svg'

const SocialSigner = dynamic(() => import('@/components/common/SocialSigner'))
import WalletLogin from '@/components/welcome/WelcomeLogin/WalletLogin'

const WalletDetails = ({ onConnect }: { onConnect: () => void }): ReactElement => {
  return (
    <>
      <Box my={1}>
        <SvgIcon inheritViewBox sx={{ width: 64, height: 64, display: 'block' }}>
          <LockIcon />
        </SvgIcon>
      </Box>

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
