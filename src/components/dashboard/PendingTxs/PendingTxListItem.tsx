import { ReactElement } from 'react'
import NextLink from 'next/link'
import styled from '@emotion/styled'
import ChevronRight from '@mui/icons-material/ChevronRight'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'
import { Grid, Typography } from '@mui/material'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import TxInfo from '@/components/transactions/TxInfo'
import TxType from '@/components/transactions/TxType'

const StyledContainer = styled.div`
  width: 100%;
  text-decoration: none;
  background-color: var(--color-background-paper);
  border: 1px solid var(--color-border-light);
  border-radius: 8px;
  box-sizing: border-box;
  &:hover {
    background-color: var(--color-secondary-background);
    border-color: var(--color-secondary-light);
  }
`

const StyledConfirmationsCount = styled.div`
  padding: 8px 12px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 12px;
  background-color: var(--color-secondary-light);
  color: var(--color-static-main);
`

const TxConfirmations = styled.div`
  display: flex;
  align-items: center;
  margin-left: auto;

  & svg {
    margin-left: 8px;
  }
`

const Spacer = styled.div`
  flex-grow: 1;
`

type PendingTxType = {
  transaction: TransactionSummary
  url: string
}

const PendingTx = ({ transaction, url }: PendingTxType): ReactElement => {
  return (
    <NextLink href={url}>
      <a>
        <StyledContainer>
          <Grid container py={1} px={2} alignItems="center" gap={1}>
            <Grid item sx={{ minWidth: '36px' }}>
              <Typography fontSize="lg" component="span">
                {isMultisigExecutionInfo(transaction.executionInfo) && transaction.executionInfo.nonce}
              </Typography>
            </Grid>

            <Grid item flexGrow={1}>
              <TxType tx={transaction} />
            </Grid>

            <TxInfo info={transaction.txInfo} />

            <Grid item xs />

            <TxConfirmations>
              {isMultisigExecutionInfo(transaction.executionInfo) ? (
                <StyledConfirmationsCount>
                  {`${transaction.executionInfo.confirmationsSubmitted}/${transaction.executionInfo.confirmationsRequired}`}
                </StyledConfirmationsCount>
              ) : (
                <Spacer />
              )}
              <ChevronRight color="border" />
            </TxConfirmations>
          </Grid>
        </StyledContainer>
      </a>
    </NextLink>
  )
}

export default PendingTx
