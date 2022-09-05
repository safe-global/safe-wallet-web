import Keyhole from '@/components/common/icons/KeyholeIcon/keyhole.svg'
import type { ComponentProps } from 'react'

import CircularIcon from '../CircularIcon'

const KeyholeIcon = (props: Pick<ComponentProps<typeof CircularIcon>, 'height' | 'width' | 'variant'>) => {
  return <CircularIcon component={Keyhole} alt="Not connected" color="error" {...props} />
}

export default KeyholeIcon
