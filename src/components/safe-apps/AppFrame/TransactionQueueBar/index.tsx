import { ReactElement, useState } from 'react'
import { Backdrop, Typography, Box, IconButton, Accordion, AccordionDetails, AccordionSummary } from '@mui/material'
import { ClickAwayListener } from '@mui/base'
import CloseIcon from '@mui/icons-material/Close'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'

import useTxQueue from '@/hooks/useTxQueue'
import PaginatedTxns from '@/components/common/PaginatedTxns'
import styles from './styles.module.css'
import { getQueuedTransactionCount } from '@/utils/transactions'

const TransactionQueueBar = (): ReactElement | null => {
  const [expanded, setExpanded] = useState(false)
  const [dismissedByUser, setDismissedByUser] = useState(false)

  const toggleQueueBar = (): void => {
    setExpanded((prev) => !prev)
  }

  const { page = { results: [] } } = useTxQueue()
  const queuedTxCount = getQueuedTransactionCount(page)

  if (dismissedByUser) {
    return null
  }

  // if you inline the expression, it will split put the `queuedTxCount` on a new line
  // and make it harder to find this text for matchers in tests
  const barTitle = `(${queuedTxCount}) Transaction queue`
  return (
    <>
      <Box className={styles.barWrapper}>
        <ClickAwayListener onClickAway={() => setExpanded(false)} mouseEvent="onMouseDown" touchEvent="onTouchStart">
          <Accordion
            expanded={expanded}
            onChange={toggleQueueBar}
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
            <AccordionSummary sx={{ '.MuiAccordionSummary-content': { alignItems: 'center' } }}>
              <Typography variant="body1" color="primary.main" fontWeight={700} sx={{ mr: 'auto' }}>
                {barTitle}
              </Typography>

              <IconButton
                onClick={(event) => {
                  event.stopPropagation()
                  toggleQueueBar()
                }}
                aria-label={`${expanded ? 'close' : 'expand'} transaction queue bar`}
                sx={{ transform: expanded ? 'rotate(180deg)' : undefined }}
              >
                <ExpandLessIcon />
              </IconButton>
              <IconButton onClick={() => setDismissedByUser(true)} aria-label="dismiss transaction queue bar">
                <CloseIcon />
              </IconButton>
            </AccordionSummary>
            <AccordionDetails>
              <PaginatedTxns useTxns={useTxQueue} disableTopActionMargins />
            </AccordionDetails>
          </Accordion>
        </ClickAwayListener>
      </Box>
      <Backdrop open={expanded} />
    </>
  )
}

export default TransactionQueueBar
