import NextLink from 'next/link'
import { useRouter } from 'next/router'
import type { ReactElement } from 'react'
import { useMemo } from 'react'
import ChevronRight from '@mui/icons-material/ChevronRight'
import type { TransactionSummary } from '@safe-global/safe-gateway-typescript-sdk'
import { Box, SvgIcon, Typography } from '@mui/material'
import { isMultisigExecutionInfo } from '@/utils/transaction-guards'
import TxInfo from '@/components/transactions/TxInfo'
import TxType from '@/components/transactions/TxType'
import css from './styles.module.css'
import OwnersIcon from '@/public/images/common/owners.svg'
import { AppRoutes } from '@/config/routes'
import { TransactionInfoType } from '@safe-global/safe-gateway-typescript-sdk'

type PendingTxType = {
  transaction: TransactionSummary
}

const PendingTx = ({ transaction }: PendingTxType): ReactElement => {
  const router = useRouter()
  const { id } = transaction

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

  const displayInfo = !transaction.txInfo.richDecodedInfo && transaction.txInfo.type !== TransactionInfoType.TRANSFER

  return (
    <NextLink href={url} passHref>
      <Box className={css.container}>
        {isMultisigExecutionInfo(transaction.executionInfo) && transaction.executionInfo.nonce}

        <Box flex={1}>
          <TxType tx={transaction} />
        </Box>

        {displayInfo && (
          <Box flex={1} className={css.txInfo}>
            <TxInfo info={transaction.txInfo} />
          </Box>
        )}

        {isMultisigExecutionInfo(transaction.executionInfo) ? (
          <Box className={css.confirmationsCount}>
            <SvgIcon component={OwnersIcon} inheritViewBox fontSize="small" />
            <Typography variant="caption" fontWeight="bold">
              {`${transaction.executionInfo.confirmationsSubmitted}/${transaction.executionInfo.confirmationsRequired}`}
            </Typography>
          </Box>
        ) : (
          <Box flexGrow={1} />
        )}

        <ChevronRight color="border" />
      </Box>
    </NextLink>
  )
}

export default PendingTx
