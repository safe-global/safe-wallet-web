import { Button, SvgIcon, Typography } from '@mui/material'
import type { MouseEvent } from 'react'

import WalletConnectIcon from '@/public/images/common/walletconnect.svg'

const Icon = (props: { onClick: (event: MouseEvent<HTMLButtonElement>) => void }) => (
  <Button onClick={props.onClick}>
    <SvgIcon component={WalletConnectIcon} inheritViewBox />
    <Typography ml={1}>WalletConnect</Typography>
  </Button>
)

export default Icon
