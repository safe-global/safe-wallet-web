import { ReactElement, useMemo, CSSProperties } from 'react'
import makeBlockie from 'ethereum-blockies-base64'

import css from './styles.module.css'

export interface IdenticonProps {
  address: string
}

const Identicon = ({ address }: IdenticonProps): ReactElement => {
  const style = useMemo<CSSProperties>(() => {
    let blockie = ''
    try {
      blockie = makeBlockie(address)
    } catch (e) {}
    return { backgroundImage: `url(${blockie})` }
  }, [address])

  return <div className={css.icon} style={style} />
}

export default Identicon
