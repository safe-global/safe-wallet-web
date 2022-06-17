import type { ReactElement } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemIcon from '@mui/material/ListItemIcon'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'

import SafeIcon from '@/components/common/SafeIcon'
import { shortenAddress } from '@/services/formatters'
import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import useSafeAddress from '@/services/useSafeAddress'
import useAddressBook from '@/services/useAddressBook'
import { selectChainById } from '@/store/chainsSlice'
import useWallet from '@/services/wallets/useWallet'
import Eye from './assets/Eye.svg'

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
  const wallet = useWallet()
  const safeAddress = useSafeAddress()
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, chainId))
  const chain = useAppSelector((state) => selectChainById(state, chainId))

  const addressBook = useAddressBook()
  const name = addressBook?.[address]

  const isOpen = address.toLowerCase() === safeAddress.toLowerCase()

  const isOwner = !!addedSafes?.[address]?.owners?.some(
    (owner) => owner.value.toLowerCase() === wallet?.address?.toLowerCase(),
  )

  const isAdded = Object.keys(addedSafes).some(
    (addedSafeAddress) => addedSafeAddress.toLowerCase() === address.toLowerCase(),
  )

  const formattedAddress = (
    <>
      <b>{chain?.shortName}</b>:{shortenAddress(address)}
    </>
  )

  const handleNavigate = (href: string) => {
    router.push(href)
    closeDrawer()
  }

  const handleOpenSafe = () => {
    handleNavigate(`/safe/home?safe=${chain?.shortName}:${address}`)
  }
  const handleAddSafe = () => {
    handleNavigate(`/welcome?chain=${chain?.shortName}`)
  }

  return (
    <ListItemButton
      key={address}
      onClick={handleOpenSafe}
      selected={isOpen}
      sx={({ palette }) => ({
        margin: isOpen ? '12px 12px 12px 6px' : '12px 12px',
        borderRadius: '8px',
        width: 'unset',
        // @ts-expect-error type '400' can't be used to index type 'PaletteColor'
        borderLeft: isOpen ? `6px solid ${palette.primary[400]}` : undefined,
        '&.Mui-selected': {
          backgroundColor: palette.secondaryGray[300],
        },
      })}
    >
      <ListItemIcon>
        <SafeIcon address={address} {...rest} />
      </ListItemIcon>
      <ListItemText
        primaryTypographyProps={{ variant: 'subtitle2' }}
        primary={name ?? formattedAddress}
        secondary={name && formattedAddress}
      />
      <ListItemSecondaryAction>
        {isAdded ? (
          isOwner ? (
            <>Balance</>
          ) : (
            <Typography variant="caption" sx={({ palette }) => ({ color: palette.secondaryBlack[300] })}>
              <Image src={Eye} alt="Read only" /> Read only
            </Typography>
          )
        ) : (
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
        )}
      </ListItemSecondaryAction>
      Edit
    </ListItemButton>
  )
}

export default SafeListItem
