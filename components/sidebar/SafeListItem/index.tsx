import { useEffect, useRef, type ReactElement } from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Link from 'next/link'

import SafeIcon from '@/components/common/SafeIcon'
import { shortenAddress } from '@/utils/formatters'
import { useAppSelector } from '@/store'
import useSafeAddress from '@/hooks/useSafeAddress'
import { selectChainById } from '@/store/chainsSlice'
import SafeListItemSecondaryAction from '@/components/sidebar/SafeListItemSecondaryAction'
import useChainId from '@/hooks/useChainId'
import { AppRoutes } from '@/config/routes'
import SafeListContextMenu from '@/components/sidebar/SafeListContextMenu'
import Box from '@mui/material/Box'
import { selectAllAddressBooks } from '@/store/addressBookSlice'

import css from './styles.module.css'

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
  const safeRef = useRef<HTMLDivElement>(null)
  const safeAddress = useSafeAddress()
  const chain = useAppSelector((state) => selectChainById(state, chainId))
  const allAddressBooks = useAppSelector(selectAllAddressBooks)

  const currChainId = useChainId()
  const isCurrentSafe = currChainId === currChainId && safeAddress.toLowerCase() === address.toLowerCase()

  useEffect(() => {
    if (isCurrentSafe && shouldScrollToSafe) {
      safeRef.current?.scrollIntoView({ block: 'center' })
    }
  }, [isCurrentSafe, shouldScrollToSafe])

  const name = allAddressBooks[chainId]?.[address]

  const isOpen = address.toLowerCase() === safeAddress.toLowerCase()

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
          <SafeListItemSecondaryAction
            chainId={chainId}
            address={address}
            onClick={closeDrawer}
            href={`${AppRoutes.welcome}?chain=${chain?.shortName}`}
          />
          <SafeListContextMenu address={address} chainId={chainId} />
        </Box>
      }
      sx={{ my: '8px', px: '8px' }}
    >
      <Link href={`${AppRoutes.safe.home}?safe=${chain?.shortName}:${address}`} passHref>
        <ListItemButton
          key={address}
          onClick={closeDrawer}
          selected={isOpen}
          sx={({ palette }) => ({
            borderLeft: isOpen ? `6px solid ${palette.primary.main}` : undefined,
            '&.Mui-selected': {
              backgroundColor: palette.border.background,
            },
            '&:hover': {
              backgroundColor: palette.primary.background,
            },
          })}
          className={css.safe}
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
      </Link>
    </ListItem>
  )
}

export default SafeListItem
