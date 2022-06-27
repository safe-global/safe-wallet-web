import { useEffect, useRef, type ReactElement } from 'react'
import { useRouter } from 'next/router'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'

import SafeIcon from '@/components/common/SafeIcon'
import { shortenAddress } from '@/utils/formatters'
import { useAppSelector } from '@/store'
import useSafeAddress from '@/hooks/useSafeAddress'
import useAddressBook from '@/hooks/useAddressBook'
import { selectChainById } from '@/store/chainsSlice'
import SafeListItemSecondaryAction from '@/components/sidebar/SafeListItemSecondaryAction'
import useChainId from '@/hooks/useChainId'
import { AppRoutes } from '@/config/routes'
import SafeListContextMenu from '@/components/sidebar/SafeListContextMenu'
import Box from '@mui/material/Box'

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
    <ListItem
      disablePadding
      secondaryAction={
        <Box display="flex" alignItems="center">
          <SafeListItemSecondaryAction chainId={chainId} address={address} handleAddSafe={handleAddSafe} />
          <SafeListContextMenu address={address} chainId={chainId} />
        </Box>
      }
      sx={{
        margin: '12px 12px',
        width: 'unset',
      }}
    >
      <ListItemButton
        key={address}
        onClick={handleOpenSafe}
        selected={isOpen}
        sx={({ palette }) => ({
          borderRadius: '8px',
          // @ts-expect-error type '400' can't be used to index type 'PaletteColor'
          borderLeft: isOpen ? `6px solid ${palette.primary[400]}` : undefined,
          paddingLeft: '22px',
          '&.Mui-selected': {
            backgroundColor: palette.gray[300],
            paddingLeft: '16px',
          },
        })}
        ref={safeRef}
      >
        <ListItemIcon>
          <SafeIcon address={address} {...rest} />
        </ListItemIcon>
        <ListItemText
          primaryTypographyProps={{ variant: 'body2' }}
          primary={name ?? formattedAddress}
          secondary={name && formattedAddress}
        />
      </ListItemButton>
    </ListItem>
  )
}

export default SafeListItem
