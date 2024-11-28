import type { ReactElement } from 'react'
import { Box, Paper, SvgIcon, Typography } from '@mui/material'
import type { Order, Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import { isMultisigExecutionInfo, isSwapTransferOrderTxInfo } from '@/utils/transaction-guards'
import ExpandableTransactionItem from '@/components/transactions/TxListItem/ExpandableTransactionItem'
import BatchIcon from '@/public/images/common/batch.svg'
import css from './styles.module.css'
import ExplorerButton from '@/components/common/ExplorerButton'
import { getBlockExplorerLink } from '@/utils/chains'
import { useCurrentChain } from '@/hooks/useChains'
import { getOrderClass } from '@/features/swap/helpers/utils'

const orderClassTitles: Record<string, string> = {
  limit: 'Limit order settlement',
  twap: 'TWAP order settlement',
  liquidity: 'Liquidity order settlement',
  market: 'Swap order settlement',
}

const getSettlementOrderTitle = (order: Order): string => {
  const orderClass = getOrderClass(order)
  return orderClassTitles[orderClass] || orderClassTitles['market']
}

const GroupedTxListItems = ({
  groupedListItems,
  transactionHash,
}: {
  groupedListItems: Transaction[]
  transactionHash: string
}): ReactElement | null => {
  const chain = useCurrentChain()
  const explorerLink = chain && getBlockExplorerLink(chain, transactionHash)?.href
  if (groupedListItems.length === 0) return null
  let title = 'Bulk transactions'
  const isSwapTransfer = isSwapTransferOrderTxInfo(groupedListItems[0].transaction.txInfo)
  if (isSwapTransfer) {
    title = getSettlementOrderTitle(groupedListItems[0].transaction.txInfo as Order)
  }
  return (
    <Paper data-testid="grouped-items" className={css.container}>
      <Box
        sx={{
          gridArea: 'icon',
        }}
      >
        <SvgIcon className={css.icon} component={BatchIcon} inheritViewBox fontSize="medium" />
      </Box>
      <Box
        sx={{
          gridArea: 'info',
        }}
      >
        <Typography noWrap>{title}</Typography>
      </Box>
      <Box className={css.action}>{groupedListItems.length} transactions</Box>
      <Box className={css.hash}>
        <ExplorerButton href={explorerLink} isCompact={false} />
      </Box>
      <Box
        className={css.txItems}
        sx={{
          gridArea: 'items',
        }}
      >
        {groupedListItems.map((tx) => {
          const nonce = isMultisigExecutionInfo(tx.transaction.executionInfo) ? tx.transaction.executionInfo.nonce : ''
          return (
            <Box
              key={tx.transaction.id}
              sx={{
                position: 'relative',
              }}
            >
              <Box className={css.nonce}>
                <Typography className={css.nonce}>{nonce}</Typography>
              </Box>
              <ExpandableTransactionItem item={tx} isBulkGroup={true} />
            </Box>
          )
        })}
      </Box>
    </Paper>
  )
}

export default GroupedTxListItems
