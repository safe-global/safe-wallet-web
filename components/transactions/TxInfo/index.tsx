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
import { useAppSelector } from 'store'
import { selectChainById } from 'store/chainsSlice'
import useSafeAddress from 'services/useSafeAddress'
import TokenAmount from 'components/common/TokenAmount'
import { shortenAddress } from 'services/formatters'

const TransferTx = ({ info }: { info: Transfer }): ReactElement => {
  const { chainId } = useSafeAddress()
  const chainConfig = useAppSelector((state) => selectChainById(state, chainId))
  const { nativeCurrency } = chainConfig || {}
  const transfer = info.transferInfo

  switch (transfer.type) {
    case TransactionTokenType.NATIVE_COIN:
      return (
        <TokenAmount
          direction={info.direction}
          value={transfer.value}
          decimals={nativeCurrency?.decimals}
          tokenSymbol={nativeCurrency?.symbol}
          logoUri={nativeCurrency?.logoUri}
        />
      )
    case TransactionTokenType.ERC20:
      return <TokenAmount direction={info.direction} {...transfer} />
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
  switch (info.type) {
    case 'Transfer':
      return <TransferTx info={info as Transfer} />
    case 'SettingsChange':
      return <SettingsChangeTx info={info as SettingsChange} />
    case 'Custom':
      return <CustomTx info={info as Custom} />
    case 'Creation':
      return <CreationTx info={info as Creation} />
    default:
      return <>Unknown transaction</>
  }
}

export default TxInfo
