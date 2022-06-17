import type { ReactElement } from 'react'
import { useRouter } from 'next/router'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemIcon from '@mui/material/ListItemIcon'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'

import SafeIcon from '@/components/common/SafeIcon'
import { shortenAddress } from '@/services/formatters'
import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import useSafeAddress from '@/services/useSafeAddress'
import useAddressBook from '@/services/useAddressBook'
import { selectChainById } from '@/store/chainsSlice'

import css from './styles.module.css'

const SafeListItem = ({
  address,
  chainId,
  closeDrawer,
  ...rest
}: {
  address: string
  chainId: string
  closeDrawer: () => void
  threshold?: string | number
  owners?: string | number
}): ReactElement => {
  const router = useRouter()
  const safeAddress = useSafeAddress()
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, chainId))
  const chain = useAppSelector((state) => selectChainById(state, chainId))

  const addressBook = useAddressBook()
  const name = addressBook?.[address]

  const isAdded = Object.keys(addedSafes).some(
    (addedSafeAddress) => addedSafeAddress.toLowerCase() === address.toLowerCase(),
  )

  const formattedAddress = (
    <>
      <b>{chain?.shortName}</b>:{shortenAddress(address)}
    </>
  )

  const handleNavigate = (href: string) => {
    router.push({ href, query: router.query })
    closeDrawer()
  }

  const handleOpenSafe = () => {
    handleNavigate(`/safe/home?safe=${chain?.shortName}:${address}`)
  }
  const handleAddSafe = () => {
    handleNavigate(`/welcome?chain=${chain?.chainId}`)
  }

  return (
    <ListItemButton key={address} onClick={handleOpenSafe}>
      <ListItemIcon className={css.check}>
        {address.toLowerCase() === safeAddress.toLowerCase() && (
          <CheckIcon
            sx={({ palette }) => ({
              // @ts-expect-error type '400' can't be used to index type 'PaletteColor'
              fill: palette.primary[400],
            })}
          />
        )}
      </ListItemIcon>
      <ListItemIcon>
        <SafeIcon address={address} {...rest} />
      </ListItemIcon>
      <ListItemText
        primaryTypographyProps={{ variant: 'subtitle2' }}
        primary={name ?? formattedAddress}
        secondary={name && formattedAddress}
      />
      {!isAdded && (
        <ListItemSecondaryAction>
          <Button
            className={css.addButton}
            sx={({ palette }) => ({
              color: palette.primary.main,
              '&:hover': {
                // @ts-expect-error type '200' can't be used to index type 'PaletteColor'
                backgroundColor: palette.primary[200],
              },
            })}
            size="small"
            disableElevation
            onClick={(e) => {
              e.stopPropagation()
              handleAddSafe()
            }}
          >
            Add Safe
          </Button>
        </ListItemSecondaryAction>
      )}
    </ListItemButton>
  )
}

export default SafeListItem
