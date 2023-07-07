import { Box, ButtonBase, SvgIcon } from '@mui/material'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { type DraftBatchItem } from '@/store/batchSlice'
import { useMemo } from 'react'
import TxType from '@/components/transactions/TxType'
import TxInfo from '@/components/transactions/TxInfo'
import DateTime from '../DateTime'
import DeleteIcon from '@/public/images/common/delete.svg'
import css from './styles.module.css'

type BatchTxItemProps = DraftBatchItem & {
  count: number
  onDelete: () => void
}

const BatchTxItem = ({ count, timestamp, txDetails, onDelete }: BatchTxItemProps) => {
  const txSummary = useMemo(
    () =>
      ({
        timestamp,
        id: txDetails.txId,
        txInfo: txDetails.txInfo,
        txStatus: txDetails.txStatus,
        safeAppInfo: txDetails.safeAppInfo,
      } as TransactionSummary),
    [timestamp, txDetails],
  )

  return (
    <Box display="flex" alignItems="center" gap={2}>
      <Box className={css.number}>{count}</Box>

      <Box flex={1} display="flex" gap={2} p={2} className={css.txSummary}>
        <TxType tx={txSummary} />

        <Box flex={1}>
          <TxInfo info={txDetails.txInfo} />
        </Box>

        <DateTime value={timestamp} />

        <Box className={css.separator} />

        <ButtonBase onClick={onDelete}>
          <SvgIcon component={DeleteIcon} inheritViewBox fontSize="small" />
        </ButtonBase>
      </Box>
    </Box>
  )
}

export default BatchTxItem
