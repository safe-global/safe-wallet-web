import { Fragment, useState, type ReactElement } from 'react'
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

const SafeList = ({ closeDrawer }: { closeDrawer: () => void }): ReactElement => {
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

  return (
    <div className={css.container}>
      <div className={css.header}>
        <Typography variant="h4" display="inline" fontWeight={700}>
          My Safes
        </Typography>
        <Track {...OVERVIEW_EVENTS.ADD_SAFE}>
          <Link href={{ pathname: AppRoutes.welcome }} passHref>
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

      {configs.map((chain) => {
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
            {/* Chain indicator */}
            <ChainIndicator chainId={chain.chainId} className={css.chainDivider} />

            {/* No Safes yet */}
            {!addedSafeEntriesOnChain.length && !ownedSafesOnChain.length && (
              <Typography variant="body2" color="primary.light" py={2}>
                <Link href={{ href: AppRoutes.welcome, query: router.query }} passHref>
                  Create or add
                </Link>{' '}
                an existing Safe on this network
              </Typography>
            )}

            {/* Added Safes */}
            <List className={css.list}>
              {addedSafeEntriesOnChain.map(([address, { threshold, owners }]) => (
                <SafeListItem
                  key={address}
                  address={address}
                  threshold={threshold}
                  owners={owners.length}
                  chainId={chain.chainId}
                  closeDrawer={closeDrawer}
                  shouldScrollToSafe
                />
              ))}

              {isCurrentChain &&
                safeAddress &&
                !addedSafesOnChain[safeAddress] &&
                !ownedSafesOnChain.includes(safeAddress) && (
                  <SafeListItem
                    address={safeAddress}
                    threshold={safe.threshold}
                    owners={safe.owners.length}
                    chainId={safe.chainId}
                    closeDrawer={closeDrawer}
                    shouldScrollToSafe
                  />
                )}
            </List>

            {/* Owned Safes */}
            {ownedSafesOnChain.length > 0 && (
              <>
                <div onClick={() => toggleOpen(chain.chainId, !isOpen)} className={css.ownedLabelWrapper}>
                  <Typography variant="body2" display="inline" className={css.ownedLabel}>
                    Safes owned on {chain.chainName} ({ownedSafesOnChain.length})
                    <IconButton disableRipple>{isOpen ? <ExpandLess /> : <ExpandMore />}</IconButton>
                  </Typography>
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
