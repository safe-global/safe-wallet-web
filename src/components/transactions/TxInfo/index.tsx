import { type ReactElement } from 'react'
import type {
  Transfer,
  Custom,
  Creation,
  TransactionInfo,
  MultiSend,
  SettingsChange,
} from '@safe-global/safe-gateway-typescript-sdk'
import { SettingsInfoType, TransferDirection } from '@safe-global/safe-gateway-typescript-sdk'
import TokenAmount from '@/components/common/TokenAmount'
import {
  isCreationTxInfo,
  isERC20Transfer,
  isERC721Transfer,
  isMultiSendTxInfo,
  isNativeTokenTransfer,
  isSettingsChangeTxInfo,
  isTransferTxInfo,
} from '@/utils/transaction-guards'
import { ellipsis, shortenAddress } from '@/utils/formatters'
import { useCurrentChain } from '@/hooks/useChains'
import EthHashInfo from '@/components/common/EthHashInfo'

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

  if (isNativeTokenTransfer(transfer)) {
    return (
      <TokenAmount
        direction={undefined}
        value={transfer.value}
        decimals={nativeCurrency?.decimals}
        tokenSymbol={nativeCurrency?.symbol}
        logoUri={withLogo ? nativeCurrency?.logoUri : undefined}
        size={16}
      />
    )
  }

  if (isERC20Transfer(transfer)) {
    return (
      <TokenAmount {...transfer} direction={undefined} logoUri={withLogo ? transfer?.logoUri : undefined} size={16} />
    )
  }

  if (isERC721Transfer(transfer)) {
    return (
      <TokenAmount
        {...transfer}
        tokenSymbol={ellipsis(`${transfer.tokenSymbol} #${transfer.tokenId}`, withLogo ? 16 : 100)}
        value="1"
        direction={undefined}
        logoUri={withLogo ? transfer?.logoUri : undefined}
        fallbackSrc="/images/common/nft-placeholder.png"
        size={16}
      />
    )
  }

  return <></>
}

const CustomTx = ({ info }: { info: Custom }): ReactElement => {
  return <>{!info.humanDescription && info.methodName}</>
}

const CreationTx = ({ info }: { info: Creation }): ReactElement => {
  return <>Safe Account created by {shortenAddress(info.creator.value)}</>
}

const MultiSendTx = ({ info }: { info: MultiSend }): ReactElement => {
  return (
    <>
      with {info.actionCount} {`action${info.actionCount > 1 ? 's' : ''}`}
    </>
  )
}

const SettingsChangeTx = ({ info }: { info: SettingsChange }): ReactElement => {
  if (
    info.settingsInfo?.type === SettingsInfoType.ENABLE_MODULE ||
    info.settingsInfo?.type === SettingsInfoType.DISABLE_MODULE
  ) {
    return <>{info.settingsInfo.module.name}</>
  }

  return <></>
}

const TxInfo = ({ info, ...rest }: { info: TransactionInfo; omitSign?: boolean; withLogo?: boolean }): ReactElement => {
  if (isSettingsChangeTxInfo(info)) {
    return <SettingsChangeTx info={info} />
  }

  if (isMultiSendTxInfo(info)) {
    return <MultiSendTx info={info} />
  }

  if (isTransferTxInfo(info)) {
    return (
      <>
        <TransferTx info={info} {...rest} />
        <>
          {info.direction === TransferDirection.OUTGOING ? 'to' : 'from'}
          <EthHashInfo address={info.recipient.value} avatarSize={16} showName={false} showPrefix={false} />
        </>
      </>
    )
  }

  if (isCreationTxInfo(info)) {
    return <CreationTx info={info} />
  }

  return <></>
}

export default TxInfo
