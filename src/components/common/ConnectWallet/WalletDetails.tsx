import { Box, Skeleton, SvgIcon } from '@mui/material'
import dynamic from 'next/dynamic'
import type { ReactElement } from 'react'

import LockIcon from '@/public/images/common/lock.svg'

const SocialSigner = dynamic(() => import('@/components/common/SocialSigner'), {
  loading: () => <Skeleton variant="rounded" height={42} width="100%" />,
})

const WalletDetails = ({ onConnect }: { onConnect: () => void }): ReactElement => {
  return (
    <>
      <Box my={1} display="flex" justifyContent="center">
        <SvgIcon inheritViewBox sx={{ width: 64, height: 64, display: 'block' }}>
          <LockIcon />
        </SvgIcon>
      </Box>

      <SocialSigner onRequirePassword={onConnect} />
    </>
  )
}

export default WalletDetails
