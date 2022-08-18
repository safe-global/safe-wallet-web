import ChainSwitcher from '@/components/common/ChainSwitcher'
import ConnectWallet from '@/components/common/ConnectWallet'
import NetworkSelector from '@/components/common/NetworkSelector'
import SafeTokenWidget, { getSafeTokenAddress } from '@/components/common/SafeTokenWidget'
import NotificationCenter from '@/components/notification-center/NotificationCenter'
import { AppRoutes } from '@/config/routes'
import useChainId from '@/hooks/useChainId'
import SafeLogo from '@/public/logo.svg'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import MenuIcon from '@mui/icons-material/Menu'
import { Box, IconButton, Paper } from '@mui/material'
import classnames from 'classnames'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { type ReactElement } from 'react'
import Track from '../Track'
import css from './styles.module.css'

type HeaderProps = {
  onMenuToggle: () => void
}

const Header = ({ onMenuToggle }: HeaderProps): ReactElement => {
  const chainId = useChainId()
  const router = useRouter()

  return (
    <Paper className={css.container}>
      <div className={css.menuButton}>
        <IconButton onClick={onMenuToggle} size="large" edge="start" color="default" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
      </div>

      <div className={css.logo}>
        <Track {...OVERVIEW_EVENTS.HOME}>
          <Link href={{ href: AppRoutes.index, query: router.query }} passHref>
            <SafeLogo alt="Safe Logo" height={29} className={css.logo} />
          </Link>
        </Track>
      </div>

      <div className={css.chainSwitcher}>
        <ChainSwitcher />
      </div>

      {!!getSafeTokenAddress(chainId) && (
        <div className={classnames(css.tokenWidget, css.element)}>
          <SafeTokenWidget />
        </div>
      )}

      <div className={classnames(css.element, css.notificationCenter)}>
        <NotificationCenter />
      </div>

      <div className={css.element}>
        <ConnectWallet />
      </div>

      <Box className={css.element} sx={{ pr: '0 !important' }}>
        <NetworkSelector />
      </Box>
    </Paper>
  )
}

export default Header
