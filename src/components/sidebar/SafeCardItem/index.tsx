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
import { selectAllAddressBooks } from '@/store/addressBookSlice'
import EthHashInfo from '@/components/common/EthHashInfo'
import { sameAddress } from '@/utils/addresses'
import SafeIcon from '@/components/common/SafeIcon'

const SafeCardItem = ({
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
    <ListItem className={classnames(css.container)} disablePadding onClick={() => onClick(address)}>
      <ListItemButton
        key={address}
        onClick={() => undefined}
        selected={isCurrentSafe}
        className={classnames(css.safe, { [css.open]: isCurrentSafe })}
        ref={safeRef}
      >
        <ListItemIcon>
          <SafeIcon address={address} {...rest} />
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

export default SafeCardItem
