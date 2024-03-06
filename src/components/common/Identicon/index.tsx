import Skeleton from '@mui/material/Skeleton'
import { blo } from 'blo'
import type { CSSProperties, ReactElement } from 'react'
import { useMemo } from 'react'

import css from './styles.module.css'

export interface IdenticonProps {
  address: string
  size?: number
}

const Identicon = ({ address, size = 40 }: IdenticonProps): ReactElement => {
  const style = useMemo<CSSProperties | null>(() => {
    try {
      const blockie = blo(address as `0x${string}`)
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
    <div data-sid="74097" className={css.icon} style={style} />
  )
}

export default Identicon
