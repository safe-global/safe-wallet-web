import TxConfirmations from '@/components/transactions/TxConfirmations'
import TxInfo from '@/components/transactions/TxInfo'
import TxType from '@/components/transactions/TxType'
import { AppRoutes } from '@/config/routes'
import useSafeInfo from '@/hooks/useSafeInfo'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import ChevronRight from '@mui/icons-material/ChevronRight'
import { Box } from '@mui/material'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import { useMemo } from 'react'
import css from './styles.module.css'

type PendingTxType = {
  transaction: TransactionSummary
}

const PendingTx = ({ transaction }: PendingTxType): ReactElement => {
  const router = useRouter()
  const { id } = transaction
  const { safe } = useSafeInfo()

  const url = useMemo(
    () => ({
      pathname: AppRoutes.transactions.tx,
      query: {
        id,
        safe: router.query.safe,
      },
    }),
    [router, id],
  )

  return (
    <NextLink data-testid="tx-pending-item" href={url} passHref>
      <Box data-sid="40318" className={css.container}>
        <Box data-sid="71498" minWidth={30}>
          {isMultisigExecutionInfo(transaction.executionInfo) && transaction.executionInfo.nonce}
        </Box>

        <Box data-sid="81027" minWidth={62}>
          <TxType tx={transaction} />
        </Box>

        <TxInfo info={transaction.txInfo} />

        <Box data-sid="52695" flexGrow={1} />

        <Box data-sid="67985" alignSelf="flex-end" display="flex" flexWrap="nowrap" alignItems="center" gap={1.5}>
          {isMultisigExecutionInfo(transaction.executionInfo) && (
            <TxConfirmations
              submittedConfirmations={transaction.executionInfo.confirmationsSubmitted}
              requiredConfirmations={transaction.executionInfo.confirmationsRequired}
            />
          )}

          <ChevronRight color="border" />
        </Box>
      </Box>
    </NextLink>
  )
}

export default PendingTx
