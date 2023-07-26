import { useAppSelector } from '@/store'
import { selectSettings } from '@/store/settingsSlice'
import { type ReactElement, useMemo } from 'react'
import css from './styles.module.css'

export function ethereumAddressToEmoji(address: string): string {
  // Convert the Ethereum address from hexadecimal to decimal
  const decimal = BigInt(address.slice(0, 6))

  // Define the Unicode ranges for animal, fruit, and vegetable emojis
  const unicodeRanges = [
    [0x1f400, 0x1f43f],
    [0x1f980, 0x1f994],
    [0x1f345, 0x1f35f],
    [0x1f950, 0x1f96b],
  ]

  // Calculate the total number of emojis
  let totalEmojis = 0
  for (let range of unicodeRanges) {
    totalEmojis += range[1] - range[0] + 1
  }

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

const AddressEmoji = ({ address, size = 40 }: { address: string; size?: number }): ReactElement | null => {
  const { addressEmojis } = useAppSelector(selectSettings)
  const emoji = useMemo<string>(() => (addressEmojis ? ethereumAddressToEmoji(address) : ''), [address, addressEmojis])

  return emoji ? (
    <div className={css.emojiWrapper} style={{ fontSize: `${size * 0.7}px`, width: `${size}px`, height: `${size}px` }}>
      {emoji}
    </div>
  ) : null
}

export default AddressEmoji
