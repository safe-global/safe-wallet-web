import CheckWallet from '@/components/common/CheckWallet'
import Track from '@/components/common/Track'
import { TxModalContext } from '@/components/tx-flow'
import { ConfirmBatchFlow, NewTxFlow } from '@/components/tx-flow/flows'
import { useDraftBatch, useUpdateBatch } from '@/hooks/useDraftBatch'
import PlusIcon from '@/public/images/common/plus.svg'
import { BATCH_EVENTS } from '@/services/analytics'
import CloseIcon from '@mui/icons-material/Close'
import { Button, Divider, Drawer, IconButton, SvgIcon, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { useCallback, useContext, useEffect, type SyntheticEvent } from 'react'
import EmptyBatch from './EmptyBatch'
import css from './styles.module.css'

const BatchReorder = dynamic(() => import('./BatchReorder'))

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
      setTxFlow(<NewTxFlow />, undefined, false)
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
    <Drawer variant="temporary" anchor="right" open={isOpen} onClose={closeSidebar} transitionDuration={100}>
      <aside className={css.aside}>
        <Typography variant="h4" fontWeight={700} mb={1}>
          Batched transactions
        </Typography>

        <Divider />

        {batchTxs.length ? (
          <>
            <div data-sid="19447" className={css.txs}>
              <BatchReorder txItems={batchTxs} onDelete={deleteTx} onReorder={onReorder} />
            </div>

            <CheckWallet>
              {(isOk) => (
                <Track {...BATCH_EVENTS.BATCH_NEW_TX}>
                  <Button data-sid="41972" onClick={onAddClick} disabled={!isOk}>
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
                    data-sid="44948"
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
                  <Button data-sid="14856" onClick={onAddClick} variant="contained" disabled={!isOk}>
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
