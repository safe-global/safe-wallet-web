import type { ReactElement } from 'react'
import { useRouter } from 'next/router'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'

import SafeIcon from '@/components/common/SafeIcon'
import { shortenAddress } from '@/services/formatters'
import { useAppSelector } from '@/store'
import useSafeAddress from '@/services/useSafeAddress'
import useAddressBook from '@/services/useAddressBook'
import { selectChainById } from '@/store/chainsSlice'
import SafeListSecondaryAction from '@/components/sidebar/SafeListSecondaryAction'

// TODO: Add scrolling to Safe on open
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
  const chain = useAppSelector((state) => selectChainById(state, chainId))

  const addressBook = useAddressBook()
  const name = addressBook?.[address]

  const isOpen = address.toLowerCase() === safeAddress.toLowerCase()

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

  const formattedAddress = (
    <>
      <b>{chain?.shortName}</b>:{shortenAddress(address)}
    </>
  )

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
      <ListItemSecondaryAction sx={{ display: 'flex', alignItems: 'center' }}>
        <SafeListSecondaryAction chainId={chainId} address={address} handleAddSafe={handleAddSafe} />
        {/*
        // TODO: Add context menu for renaming/deleting */}
        <IconButton
          edge="end"
          size="small"
          sx={{
            paddingRight: 0,
            '&:hover': {
              backgroundColor: 'unset',
            },
          }}
        >
          <MoreVertIcon sx={({ palette }) => ({ color: palette.secondaryBlack[300] })} />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItemButton>
  )
}

export default SafeListItem
