import { useDarkMode } from '@/hooks/useDarkMode'
import type { ReactElement } from 'react'
import { Unicon } from '../Unicon'

export interface IdenticonProps {
  address: string
  size?: number
}

const Identicon = ({ address, size = 40 }: IdenticonProps): ReactElement => {
  const isDarkMode = useDarkMode()
  return <Unicon address={address} size={size} isDarkMode={isDarkMode} />
}

export default Identicon
