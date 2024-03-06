import { Box } from '@mui/material'
import { type Transaction } from '@safe-global/safe-gateway-typescript-sdk'
import type { ReactElement } from 'react'

import DateTime from '@/components/common/DateTime'
import TxInfo from '@/components/transactions/TxInfo'
import TxType from '@/components/transactions/TxType'
import { useHasFeature } from '@/hooks/useChains'
import useIsPending from '@/hooks/useIsPending'
import { FEATURES } from '@/utils/chains'
import { isMultisigExecutionInfo, isTxQueued } from '@/utils/transaction-guards'
import { isTrustedTx } from '@/utils/transactions'
import classNames from 'classnames'
import TxConfirmations from '../TxConfirmations'
import TxStatusLabel from '../TxStatusLabel'
import UntrustedTxWarning from '../UntrustedTxWarning'
import QueueActions from './QueueActions'
import css from './styles.module.css'

type TxSummaryProps = {
  isGrouped?: boolean
  item: Transaction
}

const TxSummary = ({ item, isGrouped }: TxSummaryProps): ReactElement => {
  const hasDefaultTokenlist = useHasFeature(FEATURES.DEFAULT_TOKENLIST)

  const tx = item.transaction
  const isQueue = isTxQueued(tx.txStatus)
  const nonce = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo.nonce : undefined
  const isTrusted = !hasDefaultTokenlist || isTrustedTx(tx)
  const isPending = useIsPending(tx.id)
  const executionInfo = isMultisigExecutionInfo(tx.executionInfo) ? tx.executionInfo : undefined

  return (
    <Box
      data-testid="transaction-item"
      className={classNames(css.gridContainer, {
        [css.history]: !isQueue,
        [css.grouped]: isGrouped,
        [css.untrusted]: !isTrusted,
      })}
      id={tx.id}
    >
      {nonce !== undefined && !isGrouped && (
        <Box data-sid="47814" gridArea="nonce" data-testid="nonce" className={css.nonce}>
          {nonce}
        </Box>
      )}

      {!isTrusted && (
        <Box data-sid="38268" data-testid="warning" gridArea="nonce">
          <UntrustedTxWarning />
        </Box>
      )}

      <Box data-sid="86265" gridArea="type" data-testid="tx-type">
        <TxType tx={tx} />
      </Box>

      <Box data-sid="95763" gridArea="info" data-testid="tx-info">
        <TxInfo info={tx.txInfo} />
      </Box>

      <Box data-sid="40274" gridArea="date" data-testid="tx-date" className={css.date}>
        <DateTime value={tx.timestamp} />
      </Box>

      {isQueue && executionInfo && (
        <Box data-sid="98490" gridArea="confirmations">
          <TxConfirmations
            submittedConfirmations={executionInfo.confirmationsSubmitted}
            requiredConfirmations={executionInfo.confirmationsRequired}
          />
        </Box>
      )}

      <Box data-sid="37497" gridArea="status">
        {isQueue && !isPending ? <QueueActions tx={tx} /> : <TxStatusLabel tx={tx} />}
      </Box>
    </Box>
  )
}

export default TxSummary
