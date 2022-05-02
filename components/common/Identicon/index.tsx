import { ReactElement, useMemo } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import css from './styles.module.css'

interface IdenticonProps {
  address: string
}

const Identicon = ({ address }: IdenticonProps): ReactElement => {
  const iconSrc = useMemo<string>(() => {
    if (!address) return ''
    try {
      return makeBlockie(address)
    } catch (e) {
      return ''
    }
  }, [address])

  return <div className={css.icon} style={{ backgroundImage: `url(${iconSrc})` }} />
}

export default Identicon
