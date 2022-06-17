import { ReactElement } from 'react'
import css from './styles.module.css'
import chains from '@/config/chains'
import { shortenAddress } from '@/services/formatters'
import Identicon from '../Identicon'
import useChainId from '@/services/useChainId'
import useAddressBook from '@/services/useAddressBook'

type EthHashInfoProps = {
  address: string
  chainId?: string
  name?: string
  showAvatar?: boolean
  showCopyButton?: boolean
  prefix?: string
  copyPrefix?: boolean
  shortAddress?: boolean
}

const SRCEthHashInfo = ({
  address,
  prefix,
  shortAddress = true,
  showAvatar = true,
  ...props
}: EthHashInfoProps): ReactElement => {
  return (
    <div className={css.container}>
      {showAvatar && (
        <div className={css.avatar}>
          <Identicon address={address} />
        </div>
      )}

      <div>
        {props.name && <div className={css.name}>{props.name}</div>}
        <div className={css.address}>
          {prefix && <b>{prefix}:</b>}
          {shortAddress ? shortenAddress(address) : address}
        </div>
      </div>

      {props.showCopyButton && <div className={css.copy}>{/* TODO */}</div>}
    </div>
  )
}

const EthHashInfo = (props: EthHashInfoProps): ReactElement => {
  const chainId = useChainId()
  const addressBook = useAddressBook()
  const name = addressBook[props.address]
  const prefix = Object.keys(chains).find((key) => chains[key] === chainId)

  return <SRCEthHashInfo {...props} prefix={prefix} name={name} />
}

export default EthHashInfo
