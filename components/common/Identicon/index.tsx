import { ReactElement, useMemo } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import css from './styles.module.css'

interface IdenticonProps {
  address: string
}

const Identicon = ({ address }: IdenticonProps): ReactElement => {
  const iconSrc = useMemo(() => {
    try {
      return makeBlockie(address)
    } catch (e) {
      return ''
    }
  }, [address]);

  return (
    <img src={iconSrc} alt={address} className={css.icon} />
  )
}

export default Identicon
