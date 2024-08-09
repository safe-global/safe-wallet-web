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
import { Box } from '@mui/material'
import css from './styles.module.css'
import classNames from 'classnames'

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
        decimals={0}
        direction={undefined}
        logoUri={withLogo ? transfer?.logoUri : undefined}
        fallbackSrc="/images/common/nft-placeholder.png"
      />
    )
  }

  return <></>
}

const CustomTx = ({ info, truncateText }: { info: Custom; truncateText?: boolean }): ReactElement => {
  return <Box className={classNames({ [css.txInfo]: truncateText })}>{info.methodName}</Box>
}

const CreationTx = ({ info, truncateText }: { info: Creation; truncateText?: boolean }): ReactElement => {
  return (
    <Box className={classNames({ [css.txInfo]: truncateText })}>Created by {shortenAddress(info.creator.value)}</Box>
  )
}

const MultiSendTx = ({ info, truncateText }: { info: MultiSend; truncateText?: boolean }): ReactElement => {
  return (
    <Box className={classNames({ [css.txInfo]: truncateText })}>
      {info.actionCount} {`action${info.actionCount > 1 ? 's' : ''}`}
    </Box>
  )
}

const SettingsChangeTx = ({ info, truncateText }: { info: SettingsChange; truncateText?: boolean }): ReactElement => {
  if (
    info.settingsInfo?.type === SettingsInfoType.ENABLE_MODULE ||
    info.settingsInfo?.type === SettingsInfoType.DISABLE_MODULE
  ) {
    return <Box className={classNames({ [css.txInfo]: truncateText })}>{info.settingsInfo.module.name}</Box>
  }

  return <></>
}

const TxInfo = ({
  info,
  truncateText,
  ...rest
}: {
  info: TransactionInfo
  omitSign?: boolean
  withLogo?: boolean
  truncateText?: boolean
}): ReactElement => {
  if (isSettingsChangeTxInfo(info)) {
    return <SettingsChangeTx info={info} truncateText={truncateText} />
  }

  if (isMultiSendTxInfo(info)) {
    return <MultiSendTx info={info} truncateText={truncateText} />
  }

  if (isTransferTxInfo(info)) {
    return <TransferTx info={info} {...rest} />
  }

  if (isCustomTxInfo(info)) {
    return <CustomTx info={info} truncateText={truncateText} />
  }

  if (isCreationTxInfo(info)) {
    return <CreationTx info={info} truncateText={truncateText} />
  }

  if (isOrderTxInfo(info)) {
    return <SwapTx info={info} truncateText={truncateText} />
  }

  return <></>
}

export default TxInfo
