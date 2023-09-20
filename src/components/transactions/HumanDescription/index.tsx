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
import { type Transfer } from '@safe-global/safe-gateway-typescript-sdk'
import { TransferTx } from '@/components/transactions/TxInfo'
import { formatAmount } from '@/utils/formatNumber'

const AddressFragment = ({ fragment }: { fragment: RichAddressFragment }) => {
  const addressBook = useAddressBook()

  return (
    <div className={css.address}>
      <EthHashInfo address={fragment.value} name={addressBook[fragment.value]} avatarSize={20} />
    </div>
  )
}

const TokenValueFragment = ({ fragment }: { fragment: RichTokenValueFragment }) => {
  const isUnlimitedApproval = fragment.value === 'unlimited'

  return (
    <TokenAmount
      // formatAmount should ideally be done in the CGW or fragment should contain the raw value as well
      value={isUnlimitedApproval ? fragment.value : formatAmount(fragment.value)}
      direction={undefined}
      logoUri={fragment.logoUri || undefined}
      tokenSymbol={fragment.symbol || undefined}
    />
  )
}

export const TransferDescription = ({ txInfo, isSendTx }: { txInfo: Transfer; isSendTx: boolean }) => {
  const action = isSendTx ? 'Send' : 'Receive'
  const direction = isSendTx ? 'to' : 'from'
  const address = isSendTx ? txInfo.recipient.value : txInfo.sender.value
  const name = isSendTx ? txInfo.recipient.name : txInfo.sender.name

  return (
    <>
      {action}
      <TransferTx info={txInfo} omitSign={true} />
      {direction}
      <div className={css.address}>
        <EthHashInfo address={address} name={name} avatarSize={20} />
      </div>
    </>
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
