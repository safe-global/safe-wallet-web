import { ButtonBase, SvgIcon } from '@mui/material'

import WalletConnectIcon from '@/public/images/common/walletconnect.svg'

const Icon = (props: { onClick: () => void }) => (
  <ButtonBase disableRipple onClick={props.onClick}>
    <SvgIcon component={WalletConnectIcon} inheritViewBox />
  </ButtonBase>
)

export default Icon
