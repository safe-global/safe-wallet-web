import type { ReactElement, CSSProperties } from 'react'
import { useMemo } from 'react'
import makeBlockie from 'ethereum-blockies-base64'
import Skeleton from '@mui/material/Skeleton'

import css from './styles.module.css'

export interface IdenticonProps {
  address: string
  size?: number
}

const Identicon = ({ address, size = 40 }: IdenticonProps): ReactElement => {
  const style = useMemo<CSSProperties | null>(() => {
    try {
      const blockie = makeBlockie(address)
      return {
        backgroundImage: `url(${blockie})`,
        width: `${size}px`,
        height: `${size}px`,
      }
    } catch (e) {
      return null
    }
  }, [address, size])

  return !style ? (
    <Skeleton variant="circular" width={size} height={size} />
  ) : (
    <div className={css.icon} style={style} />
  )
}

export default Identicon
