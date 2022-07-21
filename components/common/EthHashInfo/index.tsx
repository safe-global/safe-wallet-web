import { ReactElement, useState } from 'react'
import css from './styles.module.css'
import chains from '@/config/chains'
import { shortenAddress } from '@/utils/formatters'
import Identicon from '../Identicon'
import useChainId from '@/hooks/useChainId'
import useAddressBook from '@/hooks/useAddressBook'
import { Box, Typography } from '@mui/material'
import ExplorerLink from '@/components/common/TokenExplorerLink'
import CopyAddressButton from '@/components/common/CopyAddressButton'

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
}

const SRCEthHashInfo = ({
  address,
  customAvatar,
  prefix,
  shortAddress = true,
  showAvatar = true,
  ...props
}: EthHashInfoProps): ReactElement => {
  const [fallbackToIdenticon, setFallbackToIdenticon] = useState(false)

  return (
    <div className={css.container}>
      {showAvatar && (
        <div className={css.avatar}>
          {!fallbackToIdenticon && customAvatar ? (
            <img src={customAvatar} alt={address} onError={() => setFallbackToIdenticon(true)} />
          ) : (
            <Identicon address={address} />
          )}
        </div>
      )}

      <div>
        {props.name && <Typography variant="body2">{props.name}</Typography>}

        <Box className={css.addressRow}>
          <Typography variant="body2">
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

const EthHashInfo = (props: EthHashInfoProps & { showName?: boolean }): ReactElement => {
  const chainId = useChainId()
  const addressBook = useAddressBook()
  // prefer address book name
  const name = props.showName === false ? undefined : addressBook[props.address] || props.name
  const prefix = Object.keys(chains).find((key) => chains[key] === chainId)

  return <SRCEthHashInfo {...props} prefix={prefix} name={name} />
}

export default EthHashInfo
