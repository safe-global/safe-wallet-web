import Keyhole from '@/components/common/icons/KeyholeIcon/keyhole.svg'

import CircularIcon from '../CircularIcon'

const KeyholeIcon = ({ size = 40 }: { size?: number }) => {
  return <CircularIcon icon={Keyhole} badgeColor="error" size={size} />
}

export default KeyholeIcon
