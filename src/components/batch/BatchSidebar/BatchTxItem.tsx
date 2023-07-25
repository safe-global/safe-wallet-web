import { type SyntheticEvent, useMemo, useState, useCallback } from 'react'
import { Accordion, AccordionDetails, AccordionSummary, Box, ButtonBase, SvgIcon } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import css from './styles.module.css'
import { type DraftBatchItem } from '@/store/batchSlice'
import TxType from '@/components/transactions/TxType'
import TxInfo from '@/components/transactions/TxInfo'
import DeleteIcon from '@/public/images/common/delete.svg'
import TxData from '@/components/transactions/TxDetails/TxData'
import { MethodDetails } from '@/components/transactions/TxDetails/TxData/DecodedData/MethodDetails'
import { TxDataRow } from '@/components/transactions/TxDetails/Summary/TxDataRow'
import { dateString } from '@/utils/formatters'
import Track from '@/components/common/Track'
import { BATCH_EVENTS } from '@/services/analytics'

type BatchTxItemProps = DraftBatchItem & {
  count: number
  onDelete?: (id: string) => void
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
  const [isExpanded, setIsExpanded] = useState<boolean>(false)

  const handleDelete = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation()
      if (confirm('Are you sure you want to delete this transaction?')) {
        onDelete?.(txDetails.txId)
      }
    },
    [onDelete, txDetails.txId],
  )

  return (
    <Box display="flex" gap={2}>
      <div className={css.number}>{count}</div>

      <Accordion elevation={0} onChange={(_, isOpen) => setIsExpanded(isOpen)} sx={{ flex: 1 }}>
        <Track {...BATCH_EVENTS.BATCH_EXPAND_TX}>
          <AccordionSummary>
            <Box flex={1} display="flex" alignItems="center" gap={2} py={0.4}>
              <TxType tx={txSummary} />

              <Box flex={1}>
                <TxInfo info={txDetails.txInfo} />
              </Box>

              {onDelete && (
                <>
                  <Box className={css.separator} />

                  <Track {...BATCH_EVENTS.BATCH_DELETE_TX}>
                    <ButtonBase onClick={handleDelete}>
                      <SvgIcon component={DeleteIcon} inheritViewBox fontSize="small" />
                    </ButtonBase>
                  </Track>
                </>
              )}

              <Box className={css.separator} />

              <ButtonBase onClick={() => null}>
                <SvgIcon component={isExpanded ? ExpandLessIcon : ExpandMoreIcon} inheritViewBox fontSize="small" />
              </ButtonBase>
            </Box>
          </AccordionSummary>
        </Track>

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
