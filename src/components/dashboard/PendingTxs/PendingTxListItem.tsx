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
import classNames from 'classnames'
import OwnersIcon from '@/public/images/common/owners.svg'
import { AppRoutes } from '@/config/routes'

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

  return (
    <NextLink href={url} passHref>
      <a>
        <Box className={classNames(css.gridContainer, css.columnTemplate)}>
          <Box gridArea="nonce">
            {isMultisigExecutionInfo(transaction.executionInfo) && transaction.executionInfo.nonce}
          </Box>

          <Box gridArea="type" className={css.columnWrap}>
            <TxType tx={transaction} />
          </Box>

          <Box gridArea="info" className={css.columnWrap}>
            <TxInfo info={transaction.txInfo} />
          </Box>

          <Box gridArea="confirmations">
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
          </Box>

          <Box gridArea="icon" marginLeft="12px">
            <ChevronRight color="border" />
          </Box>
        </Box>
      </a>
    </NextLink>
  )
}

export default PendingTx
