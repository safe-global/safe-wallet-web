import { ButtonBase, SvgIcon } from '@mui/material'
import type { MouseEvent } from 'react'

import WalletConnectIcon from '@/public/images/common/walletconnect.svg'

const Icon = (props: { onClick: (event: MouseEvent<HTMLButtonElement>) => void }) => (
  <ButtonBase disableRipple onClick={props.onClick}>
    <SvgIcon component={WalletConnectIcon} inheritViewBox />
  </ButtonBase>
)

export default Icon
