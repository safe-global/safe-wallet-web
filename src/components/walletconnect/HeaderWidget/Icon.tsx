import { Badge, ButtonBase, SvgIcon } from '@mui/material'

import WalletConnectIcon from '@/public/images/common/walletconnect.svg'
import { useDarkMode } from '@/hooks/useDarkMode'

type IconProps = {
  onClick: () => void
  sessionCount: number
  error: boolean
}

const Icon = ({ sessionCount, error = false, ...props }: IconProps): React.ReactElement => {
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
