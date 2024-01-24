import React from 'react'
import css from './styles.module.css'

import Link from 'next/link'
import { Button, SvgIcon, Typography } from '@mui/material'
import Track from '@/components/common/Track'
import AddIcon from '@/public/images/common/add.svg'
import { AppRoutes } from '@/config/routes'
import { OVERVIEW_EVENTS } from '@/services/analytics'
import SafeList from '@/components/common/OwnedSafeList'
import { useCurrentChain } from '@/hooks/useChains'
import OwnedSafeList from '@/components/common/OwnedSafeList'

const Login = () => {
  const currentChain = useCurrentChain()

  return (
    <div>
      <div className={css.header}>
        <Typography variant="h4" display="inline" fontWeight={700}>
          My Safe Accounts
        </Typography>

        <Track {...OVERVIEW_EVENTS.ADD_SAFE}>
          <Link
            href={{ pathname: AppRoutes.welcome.index, query: { chain: currentChain?.shortName } }}
            passHref
            legacyBehavior
          >
            <Button
              disableElevation
              size="small"
              variant="outlined"
              // onClick={closeDrawer}
              startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
            >
              Add
            </Button>
          </Link>
        </Track>
      </div>

      <OwnedSafeList />
      {/* <Watchlist closeDrawer={closeDrawer} /> */}
    </div>
  )
}

export default Login
