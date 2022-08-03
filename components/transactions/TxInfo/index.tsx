import { type ReactElement } from 'react'
import { Transfer, Custom, Creation, TransactionTokenType, TransactionInfo } from '@gnosis.pm/safe-react-gateway-sdk'
import TokenAmount from '@/components/common/TokenAmount'
import { isCreationTxInfo, isCustomTxInfo, isTransferTxInfo } from '@/utils/transaction-guards'
import { ellipsis, shortenAddress } from '@/utils/formatters'
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
        <TokenAmount
          {...transfer}
          tokenSymbol={ellipsis(`${transfer.tokenSymbol} #${transfer.tokenId}`, withLogo ? 16 : 100)}
          value="1"
          direction={undefined}
          logoUri={withLogo ? transfer?.logoUri : undefined}
        />
      )
    default:
      return <></>
  }
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
  if (isCustomTxInfo(info)) {
    return <CustomTx info={info} />
  }
  if (isCreationTxInfo(info)) {
    return <CreationTx info={info} />
  }
  return <></>
}

export default TxInfo
