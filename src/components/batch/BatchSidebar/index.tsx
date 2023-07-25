import type { SyntheticEvent } from 'react'
import { useCallback, useContext } from 'react'
import { Button, Divider, Drawer, IconButton, SvgIcon, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { useDraftBatch, useUpdateBatch } from '@/hooks/useDraftBatch'
import css from './styles.module.css'
import NewTxMenu from '@/components/tx-flow/flows/NewTx'
import { TxModalContext } from '@/components/tx-flow'
import ConfirmBatchFlow from '@/components/tx-flow/flows/ConfirmBatch'
import PlusIcon from '@/public/images/common/plus.svg'
import Track from '@/components/common/Track'
import { BATCH_EVENTS } from '@/services/analytics'
import BatchTxList from './BatchTxList'

const BatchSidebar = ({ isOpen, onToggle }: { isOpen: boolean; onToggle: (open: boolean) => void }) => {
  const { setTxFlow } = useContext(TxModalContext)
  const batchTxs = useDraftBatch()
  const closeSidebar = useCallback(() => onToggle(false), [onToggle])
  const [, deleteTx] = useUpdateBatch()

  const clearBatch = useCallback(() => {
    batchTxs.forEach((item) => deleteTx(item.txDetails.txId))
  }, [deleteTx, batchTxs])

  const onAddClick = useCallback(
    (e: SyntheticEvent) => {
      e.preventDefault()
      closeSidebar()
      setTxFlow(<NewTxMenu />, undefined, false)
    },
    [closeSidebar, setTxFlow],
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

  return (
    <Drawer variant="temporary" anchor="right" open={isOpen} onClose={closeSidebar}>
      <aside className={css.aside}>
        <Typography variant="h4" fontWeight={700} mb={1}>
          Batched transactions
        </Typography>

        <Divider />

        <div className={css.txs}>
          {!batchTxs.length && 'No transactions added yet'}

          <BatchTxList txItems={batchTxs} onDelete={deleteTx} />
        </div>

        <Track {...BATCH_EVENTS.BATCH_NEW_TX}>
          <Button onClick={onAddClick}>
            <SvgIcon component={PlusIcon} inheritViewBox fontSize="small" sx={{ mr: 1 }} />
            Add new transaction
          </Button>
        </Track>

        <Divider />

        <Track {...BATCH_EVENTS.BATCH_CONFIRM} label={batchTxs.length}>
          <Button variant="contained" onClick={onConfirmClick} disabled={!batchTxs.length}>
            Confirm batch
          </Button>
        </Track>

        <IconButton className={css.close} aria-label="close" onClick={closeSidebar} size="small">
          <CloseIcon fontSize="medium" />
        </IconButton>
      </aside>
    </Drawer>
  )
}

export default BatchSidebar
