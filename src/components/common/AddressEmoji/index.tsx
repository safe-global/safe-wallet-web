import { type ReactElement, memo } from 'react'
import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import css from './styles.module.css'

// Define the Unicode ranges for animal, fruit, and vegetable emojis
const unicodeRanges = [
  [0x1f600, 0x1f60e],
  [0x1f638, 0x1f63d],
  [0x1f680, 0x1f683],
  [0x2614, 0x2615],
  [0x1f330, 0x1f393],
  [0x1f3a0, 0x1f3ca],
  [0x1f400, 0x1f42a],
]

// Calculate the total number of emojis
let totalEmojis = 0
for (let range of unicodeRanges) {
  totalEmojis += range[1] - range[0] + 1
}

export function ethereumAddressToEmoji(address: string): string {
  // Convert the Ethereum address from hexadecimal to decimal
  const decimal = BigInt(address.slice(0, 6))

  // Calculate the index by taking the modulo of the decimal by the number of emojis
  let index = Number(decimal % BigInt(totalEmojis))

  // Find the corresponding emoji
  for (let range of unicodeRanges) {
    if (index < range[1] - range[0] + 1) {
      return String.fromCodePoint(range[0] + index)
    } else {
      index -= range[1] - range[0] + 1
    }
  }

  return ''
}

type EmojiProps = {
  address: string
  size?: number
}

export const Emoji = memo(function Emoji({ address, size = 40 }: EmojiProps): ReactElement {
  return (
    <div className={css.emojiWrapper} style={{ fontSize: `${size * 0.7}px`, width: `${size}px`, height: `${size}px` }}>
      {ethereumAddressToEmoji(address)}
    </div>
  )
})

const AddressEmoji = (props: EmojiProps): ReactElement | null => {
  const { addressEmojis } = useAppSelector(selectSettings)
  return addressEmojis ? <Emoji {...props} /> : null
}

export default AddressEmoji
