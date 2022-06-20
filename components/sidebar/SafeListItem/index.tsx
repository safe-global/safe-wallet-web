import { ReactElement, useEffect, useRef, useState, MouseEvent } from 'react'
import { useRouter } from 'next/router'
import Image from 'next/image'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemIcon from '@mui/material/ListItemIcon'
import IconButton from '@mui/material/IconButton'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'

import SafeIcon from '@/components/common/SafeIcon'
import { shortenAddress } from '@/services/formatters'
import { useAppDispatch, useAppSelector } from '@/store'
import useSafeAddress from '@/services/useSafeAddress'
import useAddressBook from '@/services/useAddressBook'
import { selectChainById } from '@/store/chainsSlice'
import SafeListItemSecondaryAction from '@/components/sidebar/SafeListItemSecondaryAction'
import useChainId from '@/services/useChainId'
import Pencil from './assets/Pencil.svg'
import Trash from './assets/Trash.svg'
import { removeSafe } from '@/store/addedSafesSlice'
import { AppRoutes } from '@/config/routes'

// TODO: Abstract
const ContextMenu = ({ chainId, address }: { chainId: string; address: string }) => {
  const dispatch = useAppDispatch()
  const [anchorEl, setAnchorEl] = useState<HTMLElement | undefined>()

  const handleClick = (e: MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
    setAnchorEl(e.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(undefined)
  }

  const handleRemove = () => {
    dispatch(removeSafe({ chainId, address }))
  }
  return (
    <>
      <IconButton
        edge="end"
        size="small"
        sx={{
          paddingRight: 0,
          '&:hover': {
            backgroundColor: 'unset',
          },
        }}
        onClick={(e) => {
          e.stopPropagation()
          handleClick(e)
        }}
      >
        <MoreVertIcon sx={({ palette }) => ({ color: palette.secondaryBlack[300] })} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={!!anchorEl}
        onClose={handleClose}
        sx={({ palette }) => ({
          '.MuiPaper-root': { borderRadius: '8px !important', width: '138px' },
          '.MuiList-root': { py: 0 },
          '.MuiMenuItem-root': {
            // TODO: Hover
            '&:hover': { backgroundColor: palette.gray[300] },
          },
        })}
      >
        <MenuItem onClick={handleClose}>
          <ListItemIcon sx={{ minWidth: '22px' }}>
            <Image src={Pencil} alt="Rename" />
          </ListItemIcon>{' '}
          Rename
        </MenuItem>
        <MenuItem onClick={handleRemove}>
          <ListItemIcon sx={{ minWidth: '22px' }}>
            <Image src={Trash} alt="Remove" />
          </ListItemIcon>{' '}
          Remove
        </MenuItem>
      </Menu>
    </>
  )
}

const SafeListItem = ({
  address,
  chainId,
  closeDrawer,
  shouldScrollToSafe,
  ...rest
}: {
  address: string
  chainId: string
  closeDrawer: () => void
  shouldScrollToSafe: boolean
  threshold?: string | number
  owners?: string | number
}): ReactElement => {
  const router = useRouter()
  const safeRef = useRef<HTMLDivElement>(null)
  const safeAddress = useSafeAddress()
  const chain = useAppSelector((state) => selectChainById(state, chainId))

  const currChainId = useChainId()
  const isCurrentSafe = currChainId === currChainId && safeAddress.toLowerCase() === address.toLowerCase()

  useEffect(() => {
    if (isCurrentSafe && shouldScrollToSafe) {
      safeRef.current?.scrollIntoView({ block: 'center' })
    }
  }, [isCurrentSafe, shouldScrollToSafe])

  const addressBook = useAddressBook()
  const name = addressBook?.[address]

  const isOpen = address.toLowerCase() === safeAddress.toLowerCase()

  const handleNavigate = (href: string) => {
    router.push(href)
    closeDrawer()
  }

  const handleOpenSafe = () => {
    handleNavigate(`${AppRoutes.safe.home}?safe=${chain?.shortName}:${address}`)
  }
  const handleAddSafe = () => {
    handleNavigate(`${AppRoutes.welcome}?chain=${chain?.shortName}`)
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
          backgroundColor: palette.gray[300],
        },
      })}
      ref={safeRef}
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
        <SafeListItemSecondaryAction chainId={chainId} address={address} handleAddSafe={handleAddSafe} />
        <ContextMenu address={address} chainId={chainId} />
      </ListItemSecondaryAction>
    </ListItemButton>
  )
}

export default SafeListItem
