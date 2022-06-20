import { useEffect, useRef, type ReactElement } from 'react'
import { useRouter } from 'next/router'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemIcon from '@mui/material/ListItemIcon'

import SafeIcon from '@/components/common/SafeIcon'
import { shortenAddress } from '@/services/formatters'
import { useAppSelector } from '@/store'
import useSafeAddress from '@/services/useSafeAddress'
import useAddressBook from '@/services/useAddressBook'
import { selectChainById } from '@/store/chainsSlice'
import SafeListItemSecondaryAction from '@/components/sidebar/SafeListItemSecondaryAction'
import useChainId from '@/services/useChainId'
import { AppRoutes } from '@/config/routes'
import SafeListContextMenu from '@/components/sidebar/SafeListContextMenu'

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
        <SafeListContextMenu address={address} chainId={chainId} />
      </ListItemSecondaryAction>
    </ListItemButton>
  )
}

export default SafeListItem
