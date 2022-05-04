import { shortenAddress as shorten } from '@/services/formatters'
import Identicon from '../Identicon'
import css from './styles.module.css'

export const AddressInfo = ({
  address,
  chainShortName,
  copyToClipboard,
  shortenAddress,
}: {
  address: string
  chainShortName?: string
  copyToClipboard?: boolean
  shortenAddress?: boolean
}) => {
  const copyAddressToClipboard = () => navigator.clipboard.writeText(address)
  return (
    <div className={css.container}>
      <Identicon address={address} />
      <p>
        {chainShortName && <b>{chainShortName}:</b>}
        {shortenAddress ? shorten(address) : address}
      </p>
      {copyToClipboard && <button onClick={copyAddressToClipboard}>Copy</button>}
    </div>
  )
}
