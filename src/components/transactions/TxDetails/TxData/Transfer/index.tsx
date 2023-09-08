import EthHashInfo from '@/components/common/EthHashInfo'
import { isERC20Transfer, isERC721Transfer, isNativeTokenTransfer, isTxQueued } from '@/utils/transaction-guards'
import type { TransactionStatus, Transfer } from '@safe-global/safe-gateway-typescript-sdk'
import { TransferDirection } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, Typography } from '@mui/material'
import React, { type ReactElement } from 'react'

import TransferActions from '@/components/transactions/TxDetails/TxData/Transfer/TransferActions'
import { useCurrentChain } from '@/hooks/useChains'
import TokenAmount from '@/components/common/TokenAmount'
import { ellipsis } from '@/utils/formatters'

type TransferTxInfoProps = {
  txInfo: Transfer
  txStatus: TransactionStatus
}

export const TransferTx = ({
  info,
  omitSign = false,
  withLogo = true,
  size,
}: {
  info: Transfer
  omitSign?: boolean
  withLogo?: boolean
  size?: number
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
        size={size}
      />
    )
  }

  if (isERC20Transfer(transfer)) {
    return (
      <TokenAmount {...transfer} direction={undefined} logoUri={withLogo ? transfer?.logoUri : undefined} size={size} />
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
        size={size}
      />
    )
  }

  return <></>
}

const TransferTxInfoSummary = ({ txInfo, txStatus }: TransferTxInfoProps) => {
  const { direction } = txInfo

  return (
    <Typography>
      {direction === TransferDirection.INCOMING ? 'Received' : isTxQueued(txStatus) ? 'Send' : 'Sent'}{' '}
      <b>
        <TransferTx info={txInfo} withLogo={false} omitSign />
      </b>
      {direction === TransferDirection.INCOMING ? ' from:' : ' to:'}
    </Typography>
  )
}

const TransferTxInfo = ({ txInfo, txStatus }: TransferTxInfoProps) => {
  const address = txInfo.direction.toUpperCase() === TransferDirection.INCOMING ? txInfo.sender : txInfo.recipient

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <TransferTxInfoSummary txInfo={txInfo} txStatus={txStatus} />

      <Box display="flex" alignItems="center">
        <EthHashInfo
          address={address.value}
          name={address.name}
          customAvatar={address.logoUri}
          shortAddress={false}
          hasExplorer
          showCopyButton
        >
          <TransferActions address={address.value} txInfo={txInfo} />
        </EthHashInfo>
      </Box>
    </Box>
  )
}

export default TransferTxInfo
