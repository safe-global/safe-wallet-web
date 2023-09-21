import { forwardRef, type RefObject } from 'react'
import { IconButton, SvgIcon } from '@mui/material'
import WalletConnectIcon from '@/public/images/common/walletconnect.svg'

type IconProps = {
  onClick: () => void
  ref: RefObject<HTMLButtonElement>
}

const Icon = forwardRef<HTMLButtonElement, IconProps>((props, ref) => (
  <IconButton onClick={props.onClick} ref={ref}>
    <SvgIcon component={WalletConnectIcon} inheritViewBox />
  </IconButton>
))

Icon.displayName = 'Icon'

export default Icon
