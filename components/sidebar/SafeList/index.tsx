import { Fragment, useState, type ReactElement } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useTheme } from '@mui/material/styles'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import Typography from '@mui/material/Typography'
import Collapse from '@mui/material/Collapse'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import Button from '@mui/material/Button'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'

import useChains from '@/services/useChains'
import useOwnedSafes from '@/services/useOwnedSafes'
import useChainId from '@/services/useChainId'
import { useAppSelector } from '@/store'
import { AddedSafesState, AddedSafesOnChain, selectAllAddedSafes } from '@/store/addedSafesSlice'
import useSafeAddress from '@/services/useSafeAddress'
import SafeListItem from '@/components/sidebar/SafeListItem'

import css from './styles.module.css'

const getSafesOnChain = ({
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

const shouldExpandSafeList = ({
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
  const { palette } = useTheme()

  const [open, setOpen] = useState<Record<string, boolean>>({})
  const toggleOpen = (chainId: string) => {
    setOpen((prev) => ({ [chainId]: !prev[chainId] }))
  }

  const handleAddSafe = () => {
    router.push({ href: '/welcome', query: router.query })
    closeDrawer()
  }

  return (
    <List className={css.list}>
      <ListItem>
        <ListItemText primaryTypographyProps={{ variant: 'h6', fontWeight: 700 }}>My Safes</ListItemText>
        <ListItemSecondaryAction>
          <Button
            disableElevation
            size="small"
            variant="outlined"
            onClick={handleAddSafe}
            className={css.addButton}
            // @ts-expect-error type '400' can't be used to index type 'PaletteColor'
            sx={({ palette }) => ({ border: `2px solid ${palette.primary[400]} !important` })}
            disableRipple
          >
            + Add
          </Button>
        </ListItemSecondaryAction>
      </ListItem>
      {configs.map((chain) => {
        const { ownedSafesOnChain, addedSafesOnChain } = getSafesOnChain({
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
          shouldExpandSafeList({
            isCurrentChain,
            safeAddress,
            ownedSafesOnChain,
            addedSafesOnChain,
          }) || open[chain.chainId]

        return (
          <Fragment key={chain.chainName}>
            <ListItem
              selected
              className={css.chainDivider}
              sx={{ backgroundColor: `${chain.theme.backgroundColor} !important` }}
            >
              <ListItemText
                primaryTypographyProps={{ variant: 'caption', textAlign: 'center', color: palette.black[400] }}
              >
                {chain.chainName}
              </ListItemText>
            </ListItem>

            {!addedSafeEntriesOnChain.length && !ownedSafesOnChain.length && (
              <Typography paddingY="22px" variant="subtitle2" sx={({ palette }) => ({ color: palette.black[400] })}>
                <Link href={{ href: '/welcome', query: router.query }} passHref>
                  Create or add
                </Link>{' '}
                an existing Safe on this network
              </Typography>
            )}

            {addedSafeEntriesOnChain.map(([address, { threshold, owners }]) => (
              <SafeListItem
                key={address}
                address={address}
                threshold={threshold}
                owners={owners.length}
                chainId={chain.chainId}
                closeDrawer={closeDrawer}
              />
            ))}

            {ownedSafesOnChain.length > 0 && (
              <>
                <ListItemButton onClick={() => toggleOpen(chainId)} className={css.ownedLabel} disableRipple>
                  <ListItemText primaryTypographyProps={{ variant: 'subtitle2', color: palette.black[400] }}>
                    Safes owned on {chain.chainName} ({ownedSafesOnChain.length})
                  </ListItemText>
                  {isOpen ? (
                    <ExpandLess sx={({ palette }) => ({ fill: palette.black[400] })} />
                  ) : (
                    <ExpandMore sx={({ palette }) => ({ fill: palette.black[400] })} />
                  )}
                </ListItemButton>
                <Collapse key={chainId} in={isOpen}>
                  <List sx={{ py: 0 }}>
                    {ownedSafesOnChain.map((address) => (
                      <SafeListItem key={address} address={address} chainId={chainId} closeDrawer={closeDrawer} />
                    ))}
                  </List>
                </Collapse>
              </>
            )}
          </Fragment>
        )
      })}
    </List>
  )
}

export default SafeList
