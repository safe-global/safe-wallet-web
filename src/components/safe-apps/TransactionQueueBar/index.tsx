import { ReactElement, useEffect, useState } from 'react'
import { Backdrop, Typography, Box, IconButton, Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ClickAwayListener } from '@mui/base'
import CloseIcon from '@mui/icons-material/Close'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

import useTxQueue from '@/hooks/useTxQueue'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import styles from './styles.module.css'

const Index = (): ReactElement | null => {
  const [expanded, setExpanded] = useState(false)
  const [dismissedByUser, setDismissedByUser] = useState(false)

  const onClickQueueBar = () => {
    setExpanded(true)
  }

  const onCloseQueueBar = () => {
    setExpanded(false)
  }

  const { page: { results: transactions } = { results: [] } } = useTxQueue()

  const queuedTxCount = transactions.length
  const hasPendingTransactions = queuedTxCount !== 0

  // if a new transaction is proposed, we show the transaction queue bar
  useEffect(() => {
    if (queuedTxCount) {
      setExpanded(true)
    }
  }, [queuedTxCount])

  return true ? (
    <>
      <Box className={styles.barWrapper}>
        <ClickAwayListener onClickAway={() => setExpanded(false)} mouseEvent="onMouseDown" touchEvent="onTouchStart">
          <Accordion
            data-testid="transaction-queue-bar"
            expanded={expanded}
            onChange={onClickQueueBar}
            TransitionProps={{
              timeout: {
                appear: 400,
                enter: 0,
                exit: 500,
              },
              unmountOnExit: true,
              mountOnEnter: true,
            }}
          >
            <AccordionSummary data-testid="transaction-queue-bar-summary">
              <Typography variant="body1" color="primary.main" fontWeight={700} sx={{ mr: 'auto' }}>
                ({queuedTxCount}) Transaction Queue
              </Typography>

              <IconButton
                onClick={onCloseQueueBar}
                aria-label="close transaction queue bar"
                sx={{ transform: expanded ? 'rotate(180deg)' : undefined }}
              >
                <ExpandLessIcon />
              </IconButton>
              <IconButton onClick={() => setDismissedByUser(true)} aria-label="dismiss transaction queue bar">
                <CloseIcon />
              </IconButton>
            </AccordionSummary>
            <AccordionDetails>
              <PaginatedTxns useTxns={useTxQueue} />
            </AccordionDetails>
          </Accordion>
        </ClickAwayListener>
      </Box>
      <Backdrop open={expanded} />
    </>
  ) : null
}

export default Index
