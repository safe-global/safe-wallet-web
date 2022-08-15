import { type ReactElement, useState } from 'react'
import classnames from 'classnames'
import css from './styles.module.css'
import { shortenAddress } from '@/utils/formatters'
import Identicon from '../Identicon'
import useAddressBook from '@/hooks/useAddressBook'
import { Box, Typography } from '@mui/material'
import ExplorerLink from '@/components/common/TokenExplorerLink'
import CopyAddressButton from '@/components/common/CopyAddressButton'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { useCurrentChain } from '@/hooks/useChains'

type EthHashInfoProps = {
  address: string
  chainId?: string
  name?: string | null
  showAvatar?: boolean
  showCopyButton?: boolean
  prefix?: string
  copyPrefix?: boolean
  shortAddress?: boolean
  customAvatar?: string
  hasExplorer?: boolean
  avatarSize?: number
}

const EthHashInfo = ({
  address,
  customAvatar,
  prefix = '',
  shortAddress = true,
  showAvatar = true,
  avatarSize,
  ...props
}: EthHashInfoProps): ReactElement => {
  const [fallbackToIdenticon, setFallbackToIdenticon] = useState(false)

  return (
    <div className={css.container}>
      {showAvatar && (
        <div className={classnames(css.avatar, { [css.resizeAvatar]: !avatarSize })}>
          {!fallbackToIdenticon && customAvatar ? (
            <img
              src={customAvatar}
              alt={address}
              onError={() => setFallbackToIdenticon(true)}
              width={avatarSize}
              height={avatarSize}
            />
          ) : (
            <Identicon address={address} size={avatarSize} />
          )}
        </div>
      )}

      <div className={css.nameRow}>
        {props.name && (
          <Typography variant="body2" component="div" textOverflow="ellipsis" overflow="hidden" title={props.name}>
            {props.name}
          </Typography>
        )}

        <Box className={css.addressRow}>
          <Typography variant="body2" fontWeight="inherit" component="div" className={css.address}>
            {prefix && <b>{prefix}:</b>}
            {shortAddress ? shortenAddress(address) : address}
          </Typography>

          {props.showCopyButton && <CopyAddressButton address={address} />}

          {props.hasExplorer && <ExplorerLink address={address} />}
        </Box>
      </div>
    </div>
  )
}

const PrefixedEthHashInfo = ({
  showName = true,
  ...props
}: EthHashInfoProps & { showName?: boolean }): ReactElement => {
  const settings = useAppSelector(selectSettings)
  const chain = useCurrentChain()
  const addressBook = useAddressBook()
  // prefer address book name
  const name = showName ? addressBook?.[props.address] || props.name : undefined
  const prefix = settings.shortName.show ? chain?.shortName : undefined

  return <EthHashInfo prefix={prefix} {...props} name={name} />
}

export default PrefixedEthHashInfo
