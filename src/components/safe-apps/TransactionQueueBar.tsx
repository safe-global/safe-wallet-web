import { ReactElement, useEffect, useState } from 'react'
import { useRouteMatch } from 'react-router-dom'
import { Typography } from '@mui/material'
import { ClickAwayListener } from '@mui/base'
import Accordion from '@material-ui/core/Accordion'
import AccordionSummary from '@material-ui/core/AccordionSummary'
import AccordionDetails from '@material-ui/core/AccordionDetails'
import IconButton from '@material-ui/core/IconButton'
import ExpandMoreIcon from '@material-ui/icons/ExpandLessRounded'
import CloseIcon from '@material-ui/icons/CloseRounded'
import styled from 'styled-components'
import Backdrop from '@material-ui/core/Backdrop'

import { black300, primary200, grey400, background } from 'src/theme/variables'
import { QueueTransactions } from 'src/routes/safe/components/Transactions/TxList/QueueTransactions'
import useTxQueue from '@/hooks/useTxQueue'
import PaginatedTxns from '@/components/common/PaginatedTxns'

const TransactionQueueBar = (): ReactElement | null => {
  const [expanded, setExpanded] = useState(false)

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

  return expanded && hasPendingTransactions ? (
    <>
      <Wrapper expanded={expanded}>
        <ClickAwayListener onClickAway={() => setExpanded(false)} mouseEvent="onMouseDown" touchEvent="onTouchStart">
          <StyledAccordion
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
            <StyledAccordionSummary data-testid="transaction-queue-bar-summary" expandIcon={<StyledExpandIcon />}>
              <Typography variant="h2">({queuedTxCount}) Transaction Queue</Typography>

              <StyledCloseIconButton onClick={onCloseQueueBar} aria-label="close transaction queue bar">
                <CloseIcon />
              </StyledCloseIconButton>
            </StyledAccordionSummary>
            <StyledAccordionDetails>
              <PaginatedTxns useTxns={useTxQueue} />
            </StyledAccordionDetails>
          </StyledAccordion>
        </ClickAwayListener>
      </Wrapper>
      <StyledBackdrop open={expanded} />
    </>
  ) : null
}

export default TransactionQueueBar
