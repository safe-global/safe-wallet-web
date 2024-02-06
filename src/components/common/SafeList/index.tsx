import React, { type ReactElement } from 'react'
import Link from 'next/link'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'

import { useCurrentChain } from '@/hooks/useChains'
import OwnedSafeList from '@/components/common/OwnedSafeList'

import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import { useRouter } from 'next/router'
import classNames from 'classnames'
import Watchlist from '../Watchlist'

const SafeList = ({ closeDrawer }: { closeDrawer?: () => void }): ReactElement => {
  const currentChain = useCurrentChain()
  const router = useRouter()

  const isWelcomePage = router.pathname === AppRoutes.welcome.login

  return (
    <div data-testid="sidebar-safe-container">
      <div className={classNames({ [css.container]: isWelcomePage })}>
        <div className={classNames(css.header, { [css.sidebarHeader]: !isWelcomePage })}>
          <Typography
            className={classNames({ [css.sidebarTitle]: !isWelcomePage })}
            variant="h1"
            display="inline"
            fontWeight={700}
          >
            Safe Accounts
          </Typography>

          <Link
            href={{ pathname: AppRoutes.newSafe.create, query: { chain: currentChain?.shortName } }}
            passHref
            legacyBehavior
          >
            <Button
              disableElevation
              className={css.createAccountButton}
              size="small"
              variant="contained"
              sx={{ padding: '12px 24px' }}
              onClick={closeDrawer}
            >
              Create new account
            </Button>
          </Link>
        </div>

        <OwnedSafeList closeDrawer={closeDrawer} isWelcomePage={isWelcomePage} />
        <Watchlist closeDrawer={closeDrawer} isWelcomePage={isWelcomePage} />
      </div>
    </div>
  )
}

export default SafeList
