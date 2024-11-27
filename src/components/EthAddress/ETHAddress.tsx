import { Address } from '@/src/types/address'
import { shortenAddress } from '@/src/utils/formatters'
import { Text, type TextProps, View } from 'tamagui'
import { CopyButton } from '@/src/components/CopyButton'

type Props = {
  address: Address
  copy?: boolean
  textProps?: Partial<TextProps>
}
export const EthAddress = ({ address, copy, textProps }: Props) => {
  return (
    <View gap={'$1'} flexDirection={'row'}>
      <Text color={'$color'} {...textProps}>
        {shortenAddress(address)}
      </Text>
      {copy && <CopyButton value={address} color={textProps?.color || '$color'} />}
    </View>
  )
}
