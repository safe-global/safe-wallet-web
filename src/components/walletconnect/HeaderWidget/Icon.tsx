import { Button, SvgIcon, Typography } from '@mui/material'
import WalletConnectIcon from '@/public/images/common/walletconnect.svg'
import { forwardRef } from 'react'

type IconProps = {
  onClick: () => void
  ref: React.RefObject<HTMLButtonElement>
}

const Icon = forwardRef<HTMLButtonElement, IconProps>((props, ref) => (
  <Button onClick={props.onClick} ref={ref}>
    <SvgIcon component={WalletConnectIcon} inheritViewBox />
    <Typography ml={1}>WalletConnect</Typography>
  </Button>
))

Icon.displayName = 'Icon'

export default Icon
