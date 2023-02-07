import { useRef, type ReactElement } from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import classnames from 'classnames'

import css from './styles.module.css'
import { useAppSelector } from '@/store'
import useSafeAddress from '@/hooks/useSafeAddress'
import { selectChainById } from '@/store/chainsSlice'
import useChainId from '@/hooks/useChainId'
import LinkIcon from '@/public/images/common/link.svg'
import CheckOrangeIcon from '@/public/images/common/check-circle-orange.svg'
import Box from '@mui/material/Box'
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import EthHashInfo from '@/components/common/EthHashInfo'
import { sameAddress } from '@/utils/addresses'
import { IconButton, SvgIcon } from '@mui/material'

const SafeSelectItem = ({
  address,
  chainId,
  selected,
  onClick,
  ...rest
}: {
  address: string
  chainId: string
  selected: boolean
  onClick: (address: string) => void
}): ReactElement => {
  const safeRef = useRef<HTMLDivElement>(null)
  const safeAddress = useSafeAddress()
  const chain = useAppSelector((state) => selectChainById(state, chainId))
  const allAddressBooks = useAppSelector(selectAllAddressBooks)
  const currChainId = useChainId()
  const isCurrentSafe = chainId === currChainId && sameAddress(safeAddress, address)
  const name = allAddressBooks[chainId]?.[address]
  const shortName = chain?.shortName || ''

  return (
    <ListItem
      className={classnames(css.container)}
      disablePadding
      secondaryAction={
        <Box display="flex" alignItems="center" gap={1}>
          <IconButton
            onClick={(e) => {
              e.stopPropagation()
              window.open(`https://app.safe.global/home?safe=${shortName}:${address}`, '_blank')
            }}
          >
            <SvgIcon component={LinkIcon} inheritViewBox color="border" />
          </IconButton>
        </Box>
      }
      onClick={() => onClick(address)}
    >
      <ListItemButton
        key={address}
        onClick={() => undefined}
        selected={isCurrentSafe}
        className={classnames(css.safe, { [css.open]: isCurrentSafe })}
        ref={safeRef}
      >
        <ListItemIcon>
          {selected ? (
            <CheckOrangeIcon inheritViewBox styles={{ innerWidth: '20px', innerHeight: '20px' }} />
          ) : (
            <Box
              sx={{
                border: '2px solid rgba(255, 255, 255, 0.35)',
                borderRadius: '50%',
                width: 20,
                height: 20,
              }}
            />
          )}
        </ListItemIcon>
        <ListItemText
          sx={{ pr: 10 }}
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
    </ListItem>
  )
}

export default SafeSelectItem
