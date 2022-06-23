import { ReactElement, useMemo, CSSProperties } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import Skeleton from '@mui/material/Skeleton'

import css from './styles.module.css'

export interface IdenticonProps {
  address: string
}

const Identicon = ({ address }: IdenticonProps): ReactElement => {
  const style = useMemo<CSSProperties | null>(() => {
    if (!address) {
      return null
    }

    let blockie = ''
    try {
      blockie = makeBlockie(address)
    } catch (e) {}

    return blockie ? { backgroundImage: `url(${blockie})` } : null
  }, [address])

  return !style ? <Skeleton variant="circular" width={40} height={40} /> : <div className={css.icon} style={style} />
}

export default Identicon
