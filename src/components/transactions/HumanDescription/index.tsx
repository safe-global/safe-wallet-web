import {
  type RichAddressFragment,
  type RichDecodedInfo,
  type RichTokenValueFragment,
  RichFragmentType,
} from '@safe-global/safe-gateway-typescript-sdk/dist/types/human-description'
import EthHashInfo from '@/components/common/EthHashInfo'
import css from './styles.module.css'
import useAddressBook from '@/hooks/useAddressBook'
import TokenAmount from '@/components/common/TokenAmount'
import React from 'react'

const AddressFragment = ({ fragment }: { fragment: RichAddressFragment }) => {
  const addressBook = useAddressBook()

  return (
    <div className={css.address}>
      <EthHashInfo address={fragment.value} name={addressBook[fragment.value]} avatarSize={20} />
    </div>
  )
}

const TokenValueFragment = ({ fragment }: { fragment: RichTokenValueFragment }) => {
  return (
    <TokenAmount
      value={fragment.value}
      direction={undefined}
      logoUri={fragment.logoUri || undefined}
      tokenSymbol={fragment.symbol || undefined}
      size={20}
    />
  )
}

export const HumanDescription = ({ fragments }: RichDecodedInfo) => {
  return (
    <>
      {fragments.map((fragment) => {
        switch (fragment.type) {
          case RichFragmentType.Text:
            return <span>{fragment.value}</span>
          case RichFragmentType.Address:
            return <AddressFragment fragment={fragment} />
          case RichFragmentType.TokenValue:
            return <TokenValueFragment fragment={fragment} />
        }
      })}
    </>
  )
}
