import { Badge, ButtonBase, SvgIcon } from '@mui/material'
import { useContext } from 'react'

import WalletConnectIcon from '@/public/images/common/walletconnect.svg'
import { useDarkMode } from '@/hooks/useDarkMode'
import { WalletConnectContext } from '@/services/walletconnect/WalletConnectContext'

type IconProps = {
  onClick: () => void
  sessionCount: number
  sessionInfo?: {
    name: string
    iconUrl: string
  }
}

const Icon = ({ sessionCount, sessionInfo, ...props }: IconProps): React.ReactElement => {
  const { error } = useContext(WalletConnectContext)
  const isDarkMode = useDarkMode()

  return (
    <ButtonBase disableRipple onClick={props.onClick} title="WalletConnect">
      <Badge
        variant={error ? 'dot' : 'standard'}
        badgeContent={sessionCount}
        color={error ? 'error' : isDarkMode ? 'primary' : 'secondary'}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
      >
        <SvgIcon component={WalletConnectIcon} inheritViewBox fontSize="small" />
      </Badge>
    </ButtonBase>
  )
}

export default Icon
