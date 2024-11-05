import React from 'react'
import { Avatar, Text, Theme, View } from 'tamagui'
import SafeListItem from '@/src/components/SafeListItem'
import { TransactionStatus, TransferDirection, Transfer } from '@safe-global/safe-gateway-typescript-sdk'
import {
  isERC20Transfer,
  isERC721Transfer,
  isNativeTokenTransfer,
  isOutgoingTransfer,
  isTxQueued,
} from '@/src/utils/transaction-guards'
import { ellipsis, formatValue } from '@/src/utils/formatters'
import { SafeFontIcon } from '@/src/components/SafeFontIcon/SafeFontIcon'

interface TxTokenCardProps {
  bordered?: boolean
  txStatus: TransactionStatus
  txInfo: Transfer
}

interface tokenDetails {
  value: string
  decimals?: number
  tokenSymbol?: string
  name: string
  logoUri?: string
}

const getTokenDetails = (txInfo: Transfer): tokenDetails => {
  const transfer = txInfo.transferInfo
  const unnamedToken = 'Unnamed token'

  if (isNativeTokenTransfer(transfer))
    return {
      value: formatValue(transfer.value, 18),
      // take it from the native currency slice
      decimals: 18,
      tokenSymbol: 'ETH',
      name: 'Ether',
      logoUri: 'https://safe-transaction-assets.safe.global/chains/1/currency_logo.png',
    }

  if (isERC20Transfer(transfer)) {
    return {
      value: formatValue(transfer.value, transfer.decimals || 18),
      decimals: transfer.decimals,
      logoUri: transfer.logoUri,
      tokenSymbol: ellipsis((transfer.tokenSymbol || 'Unknown Token').trim(), 6),
      name: transfer.tokenName || unnamedToken,
    }
  }

  if (isERC721Transfer(transfer)) {
    return {
      name: transfer.tokenName || unnamedToken,
      tokenSymbol: ellipsis(`${transfer.tokenSymbol || 'Unknown NFT'} #${transfer.tokenId}`, 8),
      value: '1',
      decimals: 0,
      logoUri: transfer?.logoUri,
    }
  }

  return {
    name: unnamedToken,
    value: '',
  }
}

function TxTokenCard({ bordered, txStatus, txInfo }: TxTokenCardProps) {
  const isSendTx = isOutgoingTransfer(txInfo)
  const icon = isSendTx ? 'transaction-outgoing' : 'transaction-incoming'
  const type = isSendTx ? (isTxQueued(txStatus) ? 'Send' : 'Sent') : 'Received'
  const { logoUri, name, value, tokenSymbol } = getTokenDetails(txInfo)
  const isERC721 = isERC721Transfer(txInfo.transferInfo)
  const isOutgoing = txInfo.direction === TransferDirection.OUTGOING

  return (
    <SafeListItem
      label={name}
      icon={icon}
      type={type}
      bordered={bordered}
      leftNode={
        <Theme name="logo">
          <Avatar circular size="$10">
            {logoUri && <Avatar.Image accessibilityLabel={name} source={{ uri: logoUri }} />}

            <Avatar.Fallback backgroundColor="$background">
              <View backgroundColor="$background" padding="$2" borderRadius={100}>
                <SafeFontIcon name="nft" color="$color" />
              </View>
            </Avatar.Fallback>
          </Avatar>
        </Theme>
      }
      rightNode={
        <View maxWidth="34%">
          <Text color={isOutgoing ? '$color' : '$primary'} textAlign="right">
            {isOutgoing ? '-' : '+'} {ellipsis(value, 8)} {!isERC721 && tokenSymbol}
          </Text>
        </View>
      }
    />
  )
}

export default TxTokenCard
