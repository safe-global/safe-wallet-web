import { type SyntheticEvent, useEffect } from 'react'
import { useCallback, useContext } from 'react'
import { Button, Divider, Drawer, IconButton, SvgIcon, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useDraftBatch, useUpdateBatch } from '@/hooks/useDraftBatch'
import css from './styles.module.css'
import NewTxMenu from '@/components/tx-flow/flows/NewTx'
import { TxModalContext } from '@/components/tx-flow'
import ConfirmBatchFlow from '@/components/tx-flow/flows/ConfirmBatch'
import Track from '@/components/common/Track'
import { BATCH_EVENTS } from '@/services/analytics'
import { BatchReorder } from './BatchTxList'
import CheckWallet from '@/components/common/CheckWallet'

import PlusIcon from '@/public/images/common/plus.svg'
import EmptyBatch from './EmptyBatch'

const BatchSidebar = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: (open: boolean) => void }) => {
  const { txFlow, setTxFlow } = useContext(TxModalContext)
  const batchTxs = useDraftBatch()
  const [, deleteTx, onReorder] = useUpdateBatch()

  const closeSidebar = useCallback(() => {
    onToggle(false)
  }, [onToggle])

  const clearBatch = useCallback(() => {
    batchTxs.forEach((item) => deleteTx(item.id))
  }, [deleteTx, batchTxs])

  // Close confirmation flow when batch is empty
  const isConfirmationFlow = txFlow?.type === ConfirmBatchFlow
  const shouldExitFlow = isConfirmationFlow && batchTxs.length === 0
  useEffect(() => {
    if (shouldExitFlow) {
      setTxFlow(undefined)
    }
  }, [setTxFlow, shouldExitFlow])

  const onAddClick = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault()
      setTxFlow(<NewTxMenu />, undefined, false)
    },
    [setTxFlow],
  )

  const onConfirmClick = useCallback(
    async (e: SyntheticEvent) => {
      e.preventDefault()
      if (!batchTxs.length) return
      closeSidebar()
      setTxFlow(<ConfirmBatchFlow onSubmit={clearBatch} />, undefined, false)
    },
    [setTxFlow, batchTxs, closeSidebar, clearBatch],
  )

  // Close sidebar when txFlow modal is opened
  useEffect(() => {
    if (txFlow) closeSidebar()
  }, [txFlow, closeSidebar])

  return (
    <Drawer variant="temporary" anchor="right" open={isOpen} onClose={closeSidebar}>
      <aside className={css.aside}>
        <Typography variant="h4" fontWeight={700} mb={1}>
          Batched transactions
        </Typography>

        <Divider />

        {batchTxs.length ? (
          <>
            <div className={css.txs}>
              <BatchReorder txItems={batchTxs} onDelete={deleteTx} onReorder={onReorder} />
            </div>

            <CheckWallet>
              {(isOk) => (
                <Track {...BATCH_EVENTS.BATCH_NEW_TX}>
                  <Button onClick={onAddClick} disabled={!isOk}>
                    <SvgIcon component={PlusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
                    Add new transaction
                  </Button>
                </Track>
              )}
            </CheckWallet>

            <Divider />

            <CheckWallet>
              {(isOk) => (
                <Track {...BATCH_EVENTS.BATCH_CONFIRM} label={batchTxs.length}>
                  <Button
                    variant="contained"
                    onClick={onConfirmClick}
                    disabled={!batchTxs.length || !isOk}
                    className={css.confirmButton}
                  >
                    Confirm batch
                  </Button>
                </Track>
              )}
            </CheckWallet>
          </>
        ) : (
          <EmptyBatch>
            <CheckWallet>
              {(isOk) => (
                <Track {...BATCH_EVENTS.BATCH_NEW_TX}>
                  <Button onClick={onAddClick} variant="contained" disabled={!isOk}>
                    New transaction
                  </Button>
                </Track>
              )}
            </CheckWallet>
          </EmptyBatch>
        )}

        <IconButton className={css.close} aria-label="close" onClick={closeSidebar} size="small">
          <CloseIcon fontSize="medium" />
        </IconButton>
      </aside>
    </Drawer>
  )
}

export default BatchSidebar
