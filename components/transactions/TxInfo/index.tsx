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
import { isCreationTxInfo, isCustomTxInfo, isSettingsChangeTxInfo, isTransferTxInfo } from '@/utils/transaction-guards'
import { shortenAddress } from '@/utils/formatters'
import { useCurrentChain } from '@/hooks/useChains'

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
          logoUri={withLogo ? nativeCurrency?.logoUri : undefined}
        />
      )
    case TransactionTokenType.ERC20:
      return <TokenAmount {...transfer} direction={direction} logoUri={withLogo ? transfer?.logoUri : undefined} />
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

const TxInfo = ({ info }: { info: TransactionInfo }): ReactElement => {
  if (isTransferTxInfo(info)) {
    return <TransferTx info={info} />
  }
  if (isSettingsChangeTxInfo(info)) {
    return <SettingsChangeTx info={info} />
  }
  if (isCustomTxInfo(info)) {
    return <CustomTx info={info} />
  }
  if (isCreationTxInfo(info)) {
    return <CreationTx info={info} />
  }
  return <></>
}

export default TxInfo
