import { type ReactElement } from 'react'
import {
  Transfer,
  SettingsChange,
  Custom,
  Creation,
  TransactionTokenType,
  TransactionInfo,
  TransferDirection,
} from '@gnosis.pm/safe-react-gateway-sdk'
import TokenAmount from '@/components/common/TokenAmount'
import {
  isCreationTxInfo,
  isCustomTxInfo,
  isSettingsChangeTxInfo,
  isTransferTxInfo,
} from '@/components/transactions/utils'
import { shortenAddress } from '@/services/formatters'
import { useCurrentChain } from '@/services/useChains'

export const TransferTx = ({
  info,
  omitSign = false,
  withLogo = true,
}: {
  info: Transfer
  omitSign?: boolean
  withLogo?: boolean
}): ReactElement => {
  const chainConfig = useCurrentChain()
  const { nativeCurrency } = chainConfig || {}
  const transfer = info.transferInfo
  const direction = omitSign ? undefined : info.direction

  switch (transfer.type) {
    case TransactionTokenType.NATIVE_COIN:
      return (
        <TokenAmount
          direction={direction}
          value={transfer.value}
          decimals={nativeCurrency?.decimals}
          tokenSymbol={nativeCurrency?.symbol}
          logoUri={withLogo ? nativeCurrency?.logoUri : null}
        />
      )
    case TransactionTokenType.ERC20:
      return <TokenAmount {...transfer} direction={direction} logoUri={withLogo ? transfer?.logoUri : null} />
    case TransactionTokenType.ERC721:
      return (
        <>
          {info.direction === TransferDirection.OUTGOING ? 'Sent' : 'Received'} {transfer.tokenName} #{transfer.tokenId}
        </>
      )
    default:
      return <></>
  }
}

// TODO: ask in the PR if should show anything
const SettingsChangeTx = ({ info }: { info: SettingsChange }): ReactElement => {
  return <>{info.settingsInfo?.type}</>
}

const CustomTx = ({ info }: { info: Custom }): ReactElement => {
  return <>{info.methodName}</>
}

const CreationTx = ({ info }: { info: Creation }): ReactElement => {
  return <>Safe created by {shortenAddress(info.creator.value)}</>
}

const TxInfo = ({ info }: { info: TransactionInfo }): ReactElement => (
  <>
    {isTransferTxInfo(info) ? (
      <TransferTx info={info} />
    ) : isSettingsChangeTxInfo(info) ? (
      <SettingsChangeTx info={info} />
    ) : isCustomTxInfo(info) ? (
      <CustomTx info={info} />
    ) : isCreationTxInfo(info) ? (
      <CreationTx info={info} />
    ) : null}
  </>
)

export default TxInfo
