import { shortenAddress as shorten } from '@/services/formatters'
import Identicon from '../Identicon'
import css from './styles.module.css'

/**
 *  TODO: Remove once EthHashInfo from safe-react-components is implemented
 */
export const EthHashInfo = ({
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
