import { Typography } from '@mui/material'
import {
  type RichAddressFragment,
  type RichDecodedInfo,
  type RichTokenValueFragment,
  RichFragmentType,
} from '@safe-global/safe-gateway-typescript-sdk/dist/types/human-description'
import EthHashInfo from '@/components/common/EthHashInfo'
import TokenIcon from '@/components/common/TokenIcon'
import css from './styles.module.css'
import useAddressBook from '@/hooks/useAddressBook'

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

export const HumanDescription = ({ fragments }: RichDecodedInfo) => {
  return (
    <div className={css.wrapper}>
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
    </div>
  )
}
