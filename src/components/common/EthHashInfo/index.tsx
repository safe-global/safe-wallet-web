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
import { selectChainById } from '@/store/chainsSlice'
import useChainId from '@/hooks/useChainId'

type EthHashInfoProps = {
  address: string
  chainId?: string
  name?: string | null
  showAvatar?: boolean
  showCopyButton?: boolean
  prefix?: string
  showPrefix?: boolean
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
  copyPrefix,
  showPrefix,
  shortAddress = true,
  showAvatar = true,
  avatarSize,
  name,
  showCopyButton,
  hasExplorer,
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
        {name && (
          <Typography variant="body2" component="div" textOverflow="ellipsis" overflow="hidden" title={name}>
            {name}
          </Typography>
        )}

        <Box className={css.addressRow}>
          <Typography variant="body2" fontWeight="inherit" component="div" className={css.address}>
            {showPrefix && prefix && <b>{prefix}:</b>}
            {shortAddress && shortAddress ? shortenAddress(address) : address}
          </Typography>

          {showCopyButton && <CopyAddressButton prefix={prefix} address={address} copyPrefix={copyPrefix} />}

          {hasExplorer && <ExplorerLink address={address} />}
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
  const currentChainId = useChainId()
  const chain = useAppSelector((state) => selectChainById(state, props.chainId || currentChainId))
  const addressBook = useAddressBook()

  const isAddress = props.address.length === 42
  const name = showName ? props.name || addressBook[props.address] : undefined

  return (
    <EthHashInfo
      prefix={chain?.shortName}
      showPrefix={isAddress && settings.shortName.show}
      copyPrefix={isAddress && settings.shortName.copy}
      {...props}
      name={name}
    />
  )
}

export default PrefixedEthHashInfo
