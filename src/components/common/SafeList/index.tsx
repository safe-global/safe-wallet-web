import React, { type ReactElement } from 'react'
import Link from 'next/link'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import SvgIcon from '@mui/material/SvgIcon'

import AddIcon from '@/public/images/common/add.svg'
import { useCurrentChain } from '@/hooks/useChains'
import type { AddedSafesOnChain } from '@/store/addedSafesSlice'
import OwnedSafeList from '@/components/common/OwnedSafeList'
import Watchlist from '@/components/common/Watchlist'

import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import { sameAddress } from '@/utils/addresses'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'

export const _shouldExpandSafeList = ({
  isCurrentChain,
  safeAddress,
  ownedSafesOnChain,
  addedSafesOnChain,
}: {
  isCurrentChain: boolean
  safeAddress: string
  ownedSafesOnChain: string[]
  addedSafesOnChain: AddedSafesOnChain
}): boolean => {
  let shouldExpand = false

  const addedAddressesOnChain = Object.keys(addedSafesOnChain)

  if (isCurrentChain && ownedSafesOnChain.some((address) => sameAddress(address, safeAddress))) {
    // Expand the Owned Safes if the current Safe is owned, but not added
    shouldExpand = !addedAddressesOnChain.some((address) => sameAddress(address, safeAddress))
  } else {
    // Expand the Owned Safes if there are no added Safes
    shouldExpand = !addedAddressesOnChain.length && ownedSafesOnChain.length <= MAX_EXPANDED_SAFES
  }

  return shouldExpand
}

const MAX_EXPANDED_SAFES = 3

const SafeList = ({ closeDrawer }: { closeDrawer?: () => void }): ReactElement => {
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
              onClick={closeDrawer}
              startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
            >
              Add
            </Button>
          </Link>
        </Track>
      </div>

      <OwnedSafeList closeDrawer={closeDrawer} />
      <Watchlist closeDrawer={closeDrawer} />
    </div>
  )
}

export default SafeList
