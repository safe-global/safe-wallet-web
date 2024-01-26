import React, { type ReactElement } from 'react'
import Link from 'next/link'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import SvgIcon from '@mui/material/SvgIcon'

import AddIcon from '@/public/images/common/add.svg'
import { useCurrentChain } from '@/hooks/useChains'
import OwnedSafeList from '@/components/common/OwnedSafeList'
import Watchlist from '@/components/common/Watchlist'

import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import { useRouter } from 'next/router'
import classNames from 'classnames'

const SafeList = ({ closeDrawer }: { closeDrawer?: () => void }): ReactElement => {
  const currentChain = useCurrentChain()
  const router = useRouter()

  const isWelcomePage = router.pathname === AppRoutes.welcome.login || router.pathname === AppRoutes.welcome.socialLogin

  return (
    <div>
      <div className={isWelcomePage ? css.container : ''}>
        <div className={classNames(css.header, !isWelcomePage ? css.sidebarHeader : '')}>
          <Typography variant="h1" display="inline" fontWeight={700}>
            My Safe Accounts
          </Typography>

          <Track {...OVERVIEW_EVENTS.ADD_SAFE}>
            <Link
              href={{ pathname: AppRoutes.welcome.index, query: { chain: currentChain?.shortName } }}
              passHref
              legacyBehavior
            >
              <Button disableElevation size="small" variant="contained" sx={{ p: '12px 24px' }} onClick={closeDrawer}>
                Create new account
              </Button>
            </Link>
          </Track>
        </div>

        <OwnedSafeList closeDrawer={closeDrawer} />
        {/* <Watchlist closeDrawer={closeDrawer} /> */}
      </div>
    </div>
  )
}

export default SafeList
