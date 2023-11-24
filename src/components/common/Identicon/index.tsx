import type { ReactElement } from 'react'
import { Unicon } from '../Unicon'

export interface IdenticonProps {
  address: string
  size?: number
}

const Identicon = ({ address, size = 40 }: IdenticonProps): ReactElement => {
  return <Unicon address={address} size={size} />
}

export default Identicon
