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

import useChains from '@/hooks/useChains'
import useOwnedSafes from '@/hooks/useOwnedSafes'
import useChainId from '@/hooks/useChainId'
import { useAppSelector } from '@/store'
import { AddedSafesState, AddedSafesOnChain, selectAllAddedSafes } from '@/store/addedSafesSlice'
import useSafeAddress from '@/hooks/useSafeAddress'
import SafeListItem from '@/components/sidebar/SafeListItem'
import { AppRoutes } from '@/config/routes'

import css from './styles.module.css'

export const _extractSafesByChainId = ({
  chainId,
  ownedSafes,
  addedSafes,
}: {
  chainId: string
  ownedSafes: ReturnType<typeof useOwnedSafes>
  addedSafes: AddedSafesState
}): {
  ownedSafesOnChain: string[]
  addedSafesOnChain: AddedSafesOnChain
} => {
  const ownedSafesOnChain = ownedSafes[chainId] ?? []
  const addedSafesOnChain = addedSafes[chainId] ?? {}

  return { ownedSafesOnChain, addedSafesOnChain }
}

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

  if (isCurrentChain && ownedSafesOnChain.some((address) => address.toLowerCase() === safeAddress.toLowerCase())) {
    // Expand the Owned Safes if the current Safe is owned, but not added
    shouldExpand = !addedAddressesOnChain.some((address) => address.toLowerCase() === safeAddress.toLowerCase())
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
  const safeAddress = useSafeAddress()
  const { configs } = useChains()
  const ownedSafes = useOwnedSafes()
  const addedSafes = useAppSelector(selectAllAddedSafes)

  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggleOpen = (chainId: string) => {
    setOpen((prev) => ({ [chainId]: !prev[chainId] }))
  }

  return (
    <div className={css.container}>
      <div className={css.header}>
        <Typography variant="h4" display="inline" fontWeight={700}>
          My Safes
        </Typography>
        <Link href={{ pathname: AppRoutes.welcome, query: router.query }} passHref>
          <Button disableElevation size="small" variant="outlined" onClick={closeDrawer} className={css.addButton}>
            + Add
          </Button>
        </Link>
      </div>
      {configs.map((chain) => {
        const { ownedSafesOnChain, addedSafesOnChain } = _extractSafesByChainId({
          chainId: chain.chainId,
          ownedSafes,
          addedSafes,
        })

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
            <div className={css.chainHeader}>
              <Typography
                variant="overline"
                className={css.chainDivider}
                sx={{
                  backgroundColor: `${chain.theme.backgroundColor} !important`,
                  color: chain.theme.textColor,
                }}
              >
                {chain.chainName}
              </Typography>

              {!addedSafeEntriesOnChain.length && !ownedSafesOnChain.length && (
                <Typography paddingTop="22px" variant="body2" sx={({ palette }) => ({ color: palette.black[400] })}>
                  <Link href={{ href: AppRoutes.welcome, query: router.query }} passHref>
                    Create or add
                  </Link>{' '}
                  an existing Safe on this network
                </Typography>
              )}
            </div>

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
            </List>
            {ownedSafesOnChain.length > 0 && (
              <div onClick={() => toggleOpen(chain.chainId)} className={css.ownedLabel}>
                <Typography
                  variant="body2"
                  sx={({ palette }) => ({ color: palette.black[400] })}
                  display="inline"
                  paddingTop={!addedSafeEntriesOnChain.length ? '22px' : undefined}
                >
                  Safes owned on {chain.chainName} ({ownedSafesOnChain.length})
                  <IconButton sx={({ palette }) => ({ fill: palette.black[400] })} disableRipple>
                    {isOpen ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Typography>
              </div>
            )}
            {ownedSafesOnChain.length > 0 && (
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
            )}
          </Fragment>
        )
      })}
    </div>
  )
}

export default SafeList
