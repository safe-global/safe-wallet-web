import { forwardRef, type RefObject } from 'react'
import { Button, SvgIcon, Typography } from '@mui/material'
import WalletConnectIcon from '@/public/images/common/walletconnect.svg'

type IconProps = {
  onClick: () => void
  ref: RefObject<HTMLButtonElement>
}

const Icon = forwardRef<HTMLButtonElement, IconProps>((props, ref) => (
  <Button onClick={props.onClick} ref={ref}>
    <SvgIcon component={WalletConnectIcon} inheritViewBox />
    <Typography ml={1}>WalletConnect</Typography>
  </Button>
))

Icon.displayName = 'Icon'

export default Icon
