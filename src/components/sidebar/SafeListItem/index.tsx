import { useEffect, useRef, type ReactElement } from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import Link from 'next/link'
import classnames from 'classnames'

import css from './styles.module.css'
import SafeIcon from '@/components/common/SafeIcon'
import { useAppSelector } from '@/store'
import useSafeAddress from '@/hooks/useSafeAddress'
import { selectChainById } from '@/store/chainsSlice'
import SafeListItemSecondaryAction from '@/components/sidebar/SafeListItemSecondaryAction'
import useChainId from '@/hooks/useChainId'
import { AppRoutes } from '@/config/routes'
import SafeListContextMenu from '@/components/sidebar/SafeListContextMenu'
import Box from '@mui/material/Box'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import EthHashInfo from '@/components/common/EthHashInfo'
import { sameAddress } from '@/utils/addresses'
import type { SafeActions } from '@/components/sidebar/SafeList'
import { ButtonBase, SvgIcon, Tooltip, Typography } from '@mui/material'
import CheckIcon from '@/public/images/common/check.svg'
import WalletIcon from '@/components/common/WalletIcon'
import useWallet from '@/hooks/wallets/useWallet'
import NextLink from 'next/link'
import { shortenAddress } from '@/utils/formatters'

const SafeListItem = ({
  address,
  chainId,
  closeDrawer,
  shouldScrollToSafe,
  noActions = false,
  queuedTxs,
  ...rest
}: {
  address: string
  chainId: string
  shouldScrollToSafe: boolean
  closeDrawer?: () => void
  threshold?: string | number
  owners?: string | number
  noActions?: boolean
  queuedTxs?: SafeActions
}): ReactElement => {
  const safeRef = useRef<HTMLDivElement>(null)
  const safeAddress = useSafeAddress()
  const chain = useAppSelector((state) => selectChainById(state, chainId))
  const allAddressBooks = useAppSelector(selectAllAddressBooks)
  const currChainId = useChainId()
  const isCurrentSafe = chainId === currChainId && sameAddress(safeAddress, address)
  const name = allAddressBooks[chainId]?.[address]
  const shortName = chain?.shortName || ''
  const { queued = 0, signing = 0 } = queuedTxs || {}
  const wallet = useWallet()
  const url = `${AppRoutes.transactions.queue}?safe=${shortName}:${address}`
  const shortAddress = shortenAddress(wallet?.address || '')

  // Scroll to the current Safe
  useEffect(() => {
    if (isCurrentSafe && shouldScrollToSafe) {
      safeRef.current?.scrollIntoView({ block: 'center' })
    }
  }, [isCurrentSafe, shouldScrollToSafe])

  return (
    <Box display="flex" flexDirection="row">
      <ListItem
        className={css.container}
        disablePadding
        sx={{ '& .MuiListItemSecondaryAction-root': { right: 16 } }}
        secondaryAction={
          noActions ? undefined : (
            <Box display="flex" alignItems="center" gap={1}>
              <SafeListItemSecondaryAction
                chainId={chainId}
                address={address}
                onClick={closeDrawer}
                href={{
                  pathname: AppRoutes.newSafe.load,
                  query: { chain: shortName, address },
                }}
              />
              <SafeListContextMenu name={name} address={address} chainId={chainId} />
            </Box>
          )
        }
      >
        <Box display="flex" flexDirection="row" flexGrow={1}>
          <Link href={{ pathname: AppRoutes.home, query: { safe: `${shortName}:${address}` } }} passHref>
            <ListItemButton
              key={address}
              onClick={closeDrawer}
              selected={isCurrentSafe}
              className={classnames(css.safe, { [css.open]: isCurrentSafe })}
              ref={safeRef}
            >
              <ListItemIcon>
                <SafeIcon address={address} {...rest} />
              </ListItemIcon>
              <ListItemText
                sx={noActions ? undefined : { pr: 10 }}
                primaryTypographyProps={{
                  variant: 'body2',
                  component: 'div',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
                secondaryTypographyProps={{ component: 'div', color: 'primary' }}
                primary={name || ''}
                secondary={<EthHashInfo address={address} showAvatar={false} showName={false} prefix={shortName} />}
              />
            </ListItemButton>
          </Link>
        </Box>
      </ListItem>
      <Box className={css.pendingButtons}>
        {wallet && signing > 0 && (
          <NextLink href={url} passHref>
            <Tooltip title={`${shortAddress} can confirm ${signing} transaction(s)`} placement="top" arrow>
              <ButtonBase className={css.pendingButton}>
                <WalletIcon provider={wallet.label} />
                <Typography variant="body2">{signing}</Typography>
              </ButtonBase>
            </Tooltip>
          </NextLink>
        )}
        {!!queued && (
          <NextLink href={url} passHref>
            <Tooltip title={`${queued} transactions in the queue`} placement="top" arrow>
              <ButtonBase className={css.pendingButton}>
                <SvgIcon component={CheckIcon} inheritViewBox fontSize="small" />
                <Typography variant="body2">{queued}</Typography>
              </ButtonBase>
            </Tooltip>
          </NextLink>
        )}
      </Box>
    </Box>
  )
}

export default SafeListItem
