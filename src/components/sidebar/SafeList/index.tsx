import React, { Fragment, useState, type ReactElement } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import List from '@mui/material/List'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import Button from '@mui/material/Button'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import IconButton from '@mui/material/IconButton'
import SvgIcon from '@mui/material/SvgIcon'
import Box from '@mui/material/Box'
import { Link as MuiLink } from '@mui/material'

import AddIcon from '@/public/images/common/add.svg'
import useChains from '@/hooks/useChains'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import type { AddedSafesOnChain } from '@/store/addedSafesSlice'
import { selectAllAddedSafes } from '@/store/addedSafesSlice'
import SafeListItem from '@/components/sidebar/SafeListItem'

import { AppRoutes } from '@/config/routes'
import css from './styles.module.css'
import { sameAddress } from '@/utils/addresses'
import ChainIndicator from '@/components/common/ChainIndicator'
import useSafeInfo from '@/hooks/useSafeInfo'
import Track from '@/components/common/Track'
import { OVERVIEW_EVENTS } from '@/services/analytics/events/overview'
import LoadingIcon from '@/public/images/common/loading.svg'

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

const MAX_EXPANDED_SAFES = 99
const NO_SAFE_MESSAGE = 'Create a new safe or add'

const SafeList = ({ closeDrawer }: { closeDrawer?: () => void }): ReactElement => {
  const router = useRouter()
  const chainId = useChainId()
  const { safeAddress, safe } = useSafeInfo()
  const { configs } = useChains()
  const ownedSafes = useOwnedSafes()
  const addedSafes = useAppSelector(selectAllAddedSafes)

  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggleOpen = (chainId: string, open: boolean) => {
    setOpen((prev) => ({ ...prev, [chainId]: open }))
  }

  const hasNoSafes = Object.keys(ownedSafes).length === 0 && Object.keys(addedSafes).length === 0
  const isWelcomePage = router.pathname === AppRoutes.welcome

  return (
    <div className={css.container}>
      <div className={css.header}>
        <h3>
          My Safes
        </h3>
        {!isWelcomePage && (
          <Track {...OVERVIEW_EVENTS.ADD_SAFE}>
            <Link href={{ pathname: AppRoutes.welcome }} passHref>
              <Button
                disableElevation
                className={css.addbutton}
                size="small"
                variant="outlined"
                onClick={closeDrawer}
                startIcon={<SvgIcon component={AddIcon} inheritViewBox fontSize="small" />}
              >
                Add
              </Button>
            </Link>
          </Track>
        )}
      </div>

      {hasNoSafes && (
        <Box display="flex" flexDirection="column" alignItems="center" py={6}>
          <SvgIcon component={LoadingIcon} inheritViewBox sx={{ width: '85px', height: '80px' }} />
          <Typography variant="body2" color="primary.light" textAlign="center" mt={3}>
            {!isWelcomePage ? (
              <Link href={{ pathname: AppRoutes.welcome, query: router.query }} passHref>
                <MuiLink onClick={closeDrawer}>{NO_SAFE_MESSAGE}</MuiLink>
              </Link>
            ) : (
              <>{NO_SAFE_MESSAGE}</>
            )}{' '}
            an existing one
          </Typography>
        </Box>
      )}

      {!hasNoSafes &&
        configs.map((chain) => {
          const ownedSafesOnChain = ownedSafes[chain.chainId] ?? []
          const addedSafesOnChain = addedSafes[chain.chainId] ?? {}
          const isCurrentChain = chain.chainId === chainId
          const addedSafeEntriesOnChain = Object.entries(addedSafesOnChain)

          if (!isCurrentChain && !ownedSafesOnChain.length && !addedSafeEntriesOnChain.length) {
            return null
          }

          const isOpen =
            chain.chainId in open
              ? open[chain.chainId]
              : _shouldExpandSafeList({
                  isCurrentChain,
                  safeAddress,
                  ownedSafesOnChain,
                  addedSafesOnChain,
                })

          return (
            <Fragment key={chain.chainName}>
              {/* No Safes yet */}
              {!addedSafeEntriesOnChain.length && !ownedSafesOnChain.length && (
                <Typography variant="body2" color="primary.light" p={2} textAlign="center">
                  {!isWelcomePage ? (
                    <Link href={{ pathname: AppRoutes.welcome, query: router.query }} passHref>
                      <MuiLink onClick={closeDrawer}>{NO_SAFE_MESSAGE}</MuiLink>
                    </Link>
                  ) : (
                    <>{NO_SAFE_MESSAGE}</>
                  )}{' '}
                  an existing one on this network
                </Typography>
              )}

              {/* Owned Safes */}
              {ownedSafesOnChain.length > 0 && (
                <>
                  <div onClick={() => toggleOpen(chain.chainId, !isOpen)} className={css.ownedLabelWrapper}>
                    <Typography variant="body2" display="inline" className={css.ownedLabel}>
                      {chain.chainName}
                    </Typography>
                    <IconButton disableRipple className={css.iconExpandButton}>{isOpen ? <ExpandLess /> : <ExpandMore />}</IconButton>
                  </div>

                  <Collapse key={chainId} in={isOpen}>
                    <List sx={{ py: 0 }}>
                      {ownedSafesOnChain.map((address) => (
                        <SafeListItem
                          key={address}
                          address={address}
                          chainId={chain.chainId}
                          closeDrawer={closeDrawer}
                          shouldScrollToSafe={!addedSafesOnChain[address]}
                        />
                      ))}
                    </List>
                  </Collapse>
                </>
              )}
            </Fragment>
          )
        })}
    </div>
  )
}

export default SafeList
