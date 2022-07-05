import { ReactElement } from 'react'
import css from './styles.module.css'
import chains from '@/config/chains'
import { shortenAddress } from '@/utils/formatters'
import Identicon from '../Identicon'
import useChainId from '@/hooks/useChainId'
import useAddressBook from '@/hooks/useAddressBook'
import { Typography } from '@mui/material'

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
}

const SRCEthHashInfo = ({
  address,
  customAvatar,
  prefix,
  shortAddress = true,
  showAvatar = true,
  ...props
}: EthHashInfoProps): ReactElement => {
  return (
    <div className={css.container}>
      {showAvatar && (
        <div className={css.avatar}>
          {customAvatar ? <img src={customAvatar} alt={address} /> : <Identicon address={address} />}
        </div>
      )}

      <div>
        <Typography variant="body2">{props.name}</Typography>
        <Typography variant="body2">
          {prefix && <b>{prefix}:</b>}
          {shortAddress ? shortenAddress(address) : address}
        </Typography>
      </div>

      {props.showCopyButton && <div className={css.copy}>{/* TODO */}</div>}
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
