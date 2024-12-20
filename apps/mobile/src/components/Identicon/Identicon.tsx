import { blo } from 'blo'
import { Image } from 'expo-image'
import { type Address } from '@/src/types/address'
import { View } from 'tamagui'

type Props = {
  address: Address
  rounded?: boolean
  size?: number
}

const DEFAULT_SIZE = 56
export const Identicon = ({ address, rounded, size }: Props) => {
  const style = {
    borderRadius: rounded ? '50%' : 0,
    width: size ? size : DEFAULT_SIZE,
    height: size ? size : DEFAULT_SIZE,
  }

  const blockie = blo(address)

  return (
    <View style={{ borderRadius: '50%', overflow: 'hidden' }}>
      <Image testID={'identicon-image'} source={{ uri: blockie }} style={style} />
    </View>
  )
}
