import { useRouter } from 'next/router'
import Link from 'next/link'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction'
import ListItemIcon from '@mui/material/ListItemIcon'
import Button from '@mui/material/Button'
import CheckIcon from '@mui/icons-material/Check'
import type { ReactElement } from 'react'

import Identicon from '@/components/common/Identicon'
import { shortenAddress } from '@/services/formatters'
import useChainId from '@/services/useChainId'
import { useAppSelector } from '@/store'
import { selectAddedSafes } from '@/store/addedSafesSlice'
import useSafeAddress from '@/services/useSafeAddress'

import css from './styles.module.css'

const SafeListItem = ({
  address,
  shortName,
  ...rest
}: {
  address: string
  shortName: string
  threshold?: string | number
  owners?: string | number
}): ReactElement => {
  const router = useRouter()
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const addedSafes = useAppSelector((state) => selectAddedSafes(state, chainId))

  const isAdded = Object.keys(addedSafes).some(
    (addedSafeAddress) => addedSafeAddress.toLowerCase() === address.toLowerCase(),
  )
  return (
    <ListItemButton key={address}>
      <Link href={{ href: `/${shortName}:${address}`, query: router.query }} passHref>
        <>
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
            <Identicon address={address} {...rest} />
          </ListItemIcon>
          <ListItemText primaryTypographyProps={{ variant: 'subtitle2' }}>
            <b>{shortName}</b>:{shortenAddress(address)}
          </ListItemText>
        </>
      </Link>
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
          >
            Add Safe
          </Button>
        </ListItemSecondaryAction>
      )}
    </ListItemButton>
  )
}

export default SafeListItem
