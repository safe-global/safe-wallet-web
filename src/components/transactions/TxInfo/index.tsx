import { type ReactElement } from 'react'
import type {
  Creation,
  Custom,
  MultiSend,
  SettingsChange,
  TransactionInfo,
  Transfer,
} from '@safe-global/safe-gateway-typescript-sdk'
import { SettingsInfoType } from '@safe-global/safe-gateway-typescript-sdk'
import TokenAmount from '@/components/common/TokenAmount'
import {
  isOrderTxInfo,
  isCreationTxInfo,
  isCustomTxInfo,
  isERC20Transfer,
  isERC721Transfer,
  isMultiSendTxInfo,
  isNativeTokenTransfer,
  isSettingsChangeTxInfo,
  isTransferTxInfo,
} from '@/utils/transaction-guards'
import { ellipsis, shortenAddress } from '@/utils/formatters'
import { useCurrentChain } from '@/hooks/useChains'
import { SwapTx } from '@/features/swap/components/SwapTxInfo/SwapTx'

export const TransferTx = ({
  info,
  omitSign = false,
  withLogo = true,
  preciseAmount = false,
}: {
  info: Transfer
  omitSign?: boolean
  withLogo?: boolean
  preciseAmount?: boolean
}): ReactElement => {
  const chainConfig = useCurrentChain()
  const { nativeCurrency } = chainConfig || {}
  const transfer = info.transferInfo
  const direction = omitSign ? undefined : info.direction

  if (isNativeTokenTransfer(transfer)) {
    return (
      <TokenAmount
        direction={direction}
        value={transfer.value}
        decimals={nativeCurrency?.decimals}
        tokenSymbol={nativeCurrency?.symbol}
        logoUri={withLogo ? nativeCurrency?.logoUri : undefined}
        preciseAmount={preciseAmount}
      />
    )
  }

  if (isERC20Transfer(transfer)) {
    return (
      <TokenAmount
        {...transfer}
        direction={direction}
        logoUri={withLogo ? transfer?.logoUri : undefined}
        preciseAmount={preciseAmount}
      />
    )
  }

  if (isERC721Transfer(transfer)) {
    return (
      <TokenAmount
        {...transfer}
        tokenSymbol={ellipsis(
          `${transfer.tokenSymbol ? transfer.tokenSymbol : 'Unknown NFT'} #${transfer.tokenId}`,
          withLogo ? 16 : 100,
        )}
        value="1"
        direction={undefined}
        logoUri={withLogo ? transfer?.logoUri : undefined}
        fallbackSrc="/images/common/nft-placeholder.png"
      />
    )
  }

  return <></>
}

const CustomTx = ({ info }: { info: Custom }): ReactElement => {
  return <>{info.methodName}</>
}

const CreationTx = ({ info }: { info: Creation }): ReactElement => {
  return <>Safe Account created by {shortenAddress(info.creator.value)}</>
}

const MultiSendTx = ({ info }: { info: MultiSend }): ReactElement => {
  return (
    <>
      {info.actionCount} {`action${info.actionCount > 1 ? 's' : ''}`}
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
    return <TransferTx info={info} {...rest} />
  }

  if (isCustomTxInfo(info)) {
    return <CustomTx info={info} />
  }

  if (isCreationTxInfo(info)) {
    return <CreationTx info={info} />
  }

  if (isOrderTxInfo(info)) {
    return <SwapTx info={info} />
  }

  return <></>
}

export default TxInfo
