import { Badge, ButtonBase, SvgIcon } from '@mui/material'

import WalletConnectIcon from '@/public/images/common/walletconnect.svg'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'

type IconProps = {
  onClick: () => void
  sessionCount: number
  sessionInfo?: {
    name: string
    iconUrl: string
  }
}

const Icon = ({ sessionCount, sessionInfo, ...props }: IconProps): React.ReactElement => (
  <ButtonBase disableRipple onClick={props.onClick}>
    <Badge
      badgeContent={
        sessionCount > 1
          ? sessionCount
          : sessionInfo && <SafeAppIconCard alt={sessionInfo.name} src={sessionInfo.iconUrl} width={12} height={12} />
      }
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
    >
      <SvgIcon component={WalletConnectIcon} inheritViewBox fontSize="small" />
    </Badge>
  </ButtonBase>
)

export default Icon
