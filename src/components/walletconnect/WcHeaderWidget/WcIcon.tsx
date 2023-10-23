import { type ReactElement } from 'react'
import { Badge, ButtonBase, SvgIcon } from '@mui/material'
import WalletConnectIcon from '@/public/images/common/walletconnect.svg'
import { useDarkMode } from '@/hooks/useDarkMode'
import SafeAppIconCard from '@/components/safe-apps/SafeAppIconCard'

type WcIconProps = {
  onClick: () => void
  sessionCount: number
  isError: boolean
  sessionIcon?: string
}

const WcIcon = ({ sessionCount, sessionIcon, isError, onClick }: WcIconProps): ReactElement => {
  const isDarkMode = useDarkMode()
  const showIcon = sessionCount === 1 && !!sessionIcon

  return (
    <ButtonBase onClick={onClick} title="WalletConnect" sx={{ p: 2 }}>
      <Badge
        variant={isError ? 'dot' : 'standard'}
        badgeContent={
          showIcon ? (
            <SafeAppIconCard alt="Connected dApp icon" src={sessionIcon} width={12} height={12} />
          ) : (
            sessionCount
          )
        }
        color={isError ? 'error' : showIcon ? undefined : isDarkMode ? 'primary' : 'secondary'}
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

export default WcIcon
