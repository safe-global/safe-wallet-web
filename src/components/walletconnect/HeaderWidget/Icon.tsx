import { Button, SvgIcon, Typography } from '@mui/material'
import WalletConnectIcon from '@/public/images/common/walletconnect.svg'

type IconProps = {
  onClick: () => void
  ref: React.RefObject<HTMLButtonElement>
}

const Icon = (props: IconProps) => (
  <Button onClick={props.onClick} ref={props.ref}>
    <SvgIcon component={WalletConnectIcon} inheritViewBox />
    <Typography ml={1}>WalletConnect</Typography>
  </Button>
)

export default Icon
