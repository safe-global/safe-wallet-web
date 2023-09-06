import { Typography } from '@mui/material'
import EthHashInfo from '@/components/common/EthHashInfo'
import TokenIcon from '@/components/common/TokenIcon'

import css from './styles.module.css'
import useAddressBook from '@/hooks/useAddressBook'

// TODO: Export these to the gateway-sdk
export enum ValueType {
  Text = 'text',
  TokenValue = 'tokenValue',
  Address = 'address',
}

export interface RichTokenValueFragment {
  type: ValueType.TokenValue
  value: string
  symbol: string | null
  logoUri: string | null
}

export interface RichTextFragment {
  type: ValueType.Text
  value: string
}

export interface RichAddressFragment {
  type: ValueType.Address
  value: `0x${string}`
}

export type HumanDescriptionFragment = RichTextFragment | RichTokenValueFragment | RichAddressFragment

const AddressFragment = ({ fragment }: { fragment: RichAddressFragment }) => {
  const addressBook = useAddressBook()

  return (
    <div className={css.address}>
      <EthHashInfo address={fragment.value} name={addressBook[fragment.value]} avatarSize={20} />
    </div>
  )
}

const TokenValueFragment = ({ fragment }: { fragment: RichTokenValueFragment }) => {
  const address = (
    <>
      <TokenIcon logoUri={fragment.logoUri || undefined} tokenSymbol={fragment.symbol || undefined} size={20} />
      {fragment.symbol}
    </>
  )

  return (
    <Typography className={css.value}>
      {fragment.value} {address}
    </Typography>
  )
}

export const HumanDescription = ({ fragments }: { fragments: HumanDescriptionFragment[] }) => {
  return (
    <div className={css.wrapper}>
      {fragments.map((fragment) => {
        switch (fragment.type) {
          case ValueType.Text:
            return <span>{fragment.value}</span>
          case ValueType.Address:
            return <AddressFragment fragment={fragment} />
          case ValueType.TokenValue:
            return <TokenValueFragment fragment={fragment} />
        }
      })}
    </div>
  )
}
