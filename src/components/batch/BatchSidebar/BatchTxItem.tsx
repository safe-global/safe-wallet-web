import { type SyntheticEvent, useMemo, useCallback } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, ButtonBase, SvgIcon } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import css from './styles.module.css'
import { type DraftBatchItem } from '@/store/batchSlice'
import TxType from '@/components/transactions/TxType'
import TxInfo from '@/components/transactions/TxInfo'
import DeleteIcon from '@/public/images/common/delete.svg'
import DragIcon from '@/public/images/common/drag.svg'
import TxData from '@/components/transactions/TxDetails/TxData'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { dateString } from '@/utils/formatters'
import { BATCH_EVENTS, trackEvent } from '@/services/analytics'

type BatchTxItemProps = DraftBatchItem & {
  id: string
  count: number
  onDelete?: (id: string) => void
  draggable?: boolean
  dragging?: boolean
}

const BatchTxItem = ({
  id,
  count,
  timestamp,
  txDetails,
  onDelete,
  dragging = false,
  draggable = false,
}: BatchTxItemProps) => {
  const txSummary = useMemo(
    () => ({
      timestamp,
      id: txDetails.txId,
      txInfo: txDetails.txInfo,
      txStatus: txDetails.txStatus,
      safeAppInfo: txDetails.safeAppInfo,
    }),
    [timestamp, txDetails],
  )

  const handleDelete = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation()
      if (confirm('Are you sure you want to delete this transaction?')) {
        onDelete?.(id)
        trackEvent(BATCH_EVENTS.BATCH_DELETE_TX)
      }
    },
    [onDelete, id],
  )

  const handleExpand = () => {
    trackEvent(BATCH_EVENTS.BATCH_EXPAND_TX)
  }

  return (
    <Box display="flex" gap={2}>
      <div className={css.number}>{count}</div>

      <Accordion elevation={0} sx={{ flex: 1 }} onChange={handleExpand}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} disabled={dragging} className={css.accordion}>
          <Box flex={1} display="flex" alignItems="center" gap={2} py={0.4}>
            {draggable && (
              <SvgIcon
                component={DragIcon}
                inheritViewBox
                fontSize="small"
                className={css.dragHandle}
                onClick={(e: MouseEvent) => e.stopPropagation()}
              />
            )}

            <TxType tx={txSummary} />

            <Box flex={1}>
              <TxInfo info={txDetails.txInfo} />
            </Box>

            {onDelete && (
              <>
                <Box className={css.separator} />

                <ButtonBase onClick={handleDelete} sx={{ p: 0.5 }}>
                  <SvgIcon component={DeleteIcon} inheritViewBox fontSize="small" />
                </ButtonBase>

                <Box className={css.separator} mr={2} />
              </>
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <div className={css.details}>
            <TxData txDetails={txDetails} />

            <TxDataRow title="Created:">{timestamp ? dateString(timestamp) : null}</TxDataRow>

            {txDetails.txData?.dataDecoded && <MethodDetails data={txDetails.txData.dataDecoded} />}
          </div>
        </AccordionDetails>
      </Accordion>
    </Box>
  )
}

export default BatchTxItem
