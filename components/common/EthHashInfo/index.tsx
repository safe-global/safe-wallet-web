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
  shortName?: string
  copyPrefix?: boolean
  shortAddress?: boolean
  customBlockie?: string
}

const SRCEthHashInfo = ({
  address,
  customBlockie,
  shortName,
  shortAddress = true,
  showAvatar = true,
  ...props
}: EthHashInfoProps): ReactElement => {
  return (
    <div className={css.container}>
      {showAvatar && (
        <div className={css.avatar}>
          <Identicon address={address} customBlockie={customBlockie} />
        </div>
      )}

      <div>
        {props.name && <b>{props.name}</b>}
        <div>
          {shortName && <b>{shortName}:</b>}
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
  const shortName = Object.keys(chains).find((key) => chains[key] === chainId)

  return <SRCEthHashInfo {...props} shortName={shortName} name={name} />
}

export default EthHashInfo
