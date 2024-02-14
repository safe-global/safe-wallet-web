import { useMemo } from 'react'
import { ListItemButton, Box, Typography } from '@mui/material'
import Link from 'next/link'
import SafeIcon from '@/components/common/SafeIcon'
import Track from '@/components/common/Track'
import { OPEN_SAFE_LABELS, OVERVIEW_EVENTS } from '@/services/analytics'
import { AppRoutes } from '@/config/routes'
import { useAppSelector } from '@/store'
import { selectChainById } from '@/store/chainsSlice'
import ChainIndicator from '@/components/common/ChainIndicator'
import css from './styles.module.css'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import { shortenAddress } from '@/utils/formatters'
import SafeListContextMenu from '@/components/sidebar/SafeListContextMenu'

type AccountItemProps = {
  chainId: string
  address: string
  threshold?: number
  owners?: number
}

const getSafeHref = (prefix: string, address: string) => ({
  pathname: AppRoutes.home,
  query: { safe: `${prefix}:${address}` },
})

const AccountItem = ({ chainId, address, ...rest }: AccountItemProps) => {
  const chain = useAppSelector((state) => selectChainById(state, chainId))

  const href = useMemo(() => {
    return chain ? getSafeHref(chain.shortName, address) : ''
  }, [chain, address])

  const name = useAppSelector(selectAllAddressBooks)[chainId]?.[address]

  return (
    <ListItemButton className={css.listItem}>
      <Track {...OVERVIEW_EVENTS.OPEN_SAFE} label={OPEN_SAFE_LABELS.login_page}>
        <Link href={href} className={css.safeLink}>
          <SafeIcon address={address} {...rest} />

          <Typography variant="body2" component="div" className={css.safeAddress}>
            {name && (
              <Typography fontWeight="bold" fontSize="inherit">
                {name}
              </Typography>
            )}
            <b>{chain?.shortName}: </b>
            <Typography color="text.secondary" fontSize="inherit" component="span">
              {shortenAddress(address)}
            </Typography>
          </Typography>

          <Box flex={1} />

          <ChainIndicator chainId={chainId} responsive />
        </Link>
      </Track>

      <SafeListContextMenu name={name} address={address} chainId={chainId} />
    </ListItemButton>
  )
}

export default AccountItem
