import { useContext, useState } from 'react'
import { type NextRouter, useRouter } from 'next/router'
import { Box, Tooltip, Typography } from '@mui/material'
import DeleteIcon from '@/public/images/common/delete.svg'
import CancelIcon from '@/public/images/common/cancel.svg'
import ReplaceTxIcon from '@/public/images/transactions/replace-tx.svg'
import CachedIcon from '@mui/icons-material/Cached'
import { useQueuedTxByNonce } from '@/hooks/useTxQueue'
import { isCustomTxInfo } from '@/utils/transaction-guards'

import css from './styles.module.css'
import { TxModalContext } from '../..'
import TokenTransferFlow from '../TokenTransfer'
import RejectTx from '../RejectTx'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import TxCard from '@/components/tx-flow/common/TxCard'
import DeleteTxModal from './DeleteTxModal'
import ExternalLink from '@/components/common/ExternalLink'
import ChoiceButton from '@/components/common/ChoiceButton'
import useWallet from '@/hooks/wallets/useWallet'
import { sameAddress } from '@/utils/addresses'
import { AppRoutes } from '@/config/routes'

const goToQueue = (router: NextRouter) => {
  if (router.pathname === AppRoutes.transactions.tx) {
    router.push({
      pathname: AppRoutes.transactions.queue,
      query: { safe: router.query.safe },
    })
  }
}

const ReplaceTxMenu = ({
  txNonce,
  safeTxHash,
  proposer,
}: {
  txNonce: number
  safeTxHash?: string
  proposer?: string
}) => {
  const router = useRouter()
  const wallet = useWallet()
  const { setTxFlow } = useContext(TxModalContext)
  const queuedTxsByNonce = useQueuedTxByNonce(txNonce)
  const canCancel = !queuedTxsByNonce?.some(
    (item) => isCustomTxInfo(item.transaction.txInfo) && item.transaction.txInfo.isCancellation,
  )
  const canDelete = proposer && wallet && sameAddress(wallet.address, proposer)
  const [isDeleting, setIsDeleting] = useState(false)

  const onDeleteSuccess = () => {
    setIsDeleting(false)
    goToQueue(router)
    setTxFlow(undefined)
  }
  const onDeleteClose = () => setIsDeleting(false)

  return (
    <TxLayout title={`Reject transaction #${txNonce}`} step={0} hideNonce isReplacement>
      <TxCard>
        <Box mt={2} textAlign="center">
          <ReplaceTxIcon />
        </Box>

        <Typography variant="body2" mt={-1} mb={1}>
          You can replace or reject this transaction on-chain. It requires gas fees and your signature.{' '}
          <ExternalLink href="https://help.safe.global/en/articles/40836-why-do-i-need-to-pay-for-cancelling-a-transaction">
            Read more
          </ExternalLink>{' '}
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          <ChoiceButton
            icon={CachedIcon}
            onClick={() => setTxFlow(<TokenTransferFlow txNonce={txNonce} />)}
            title="Replace with another transaction"
            description="Overwrite by a new transaction with the same nonce"
            chip="Recommended"
          />

          <Tooltip
            arrow
            placement="top"
            title={canCancel ? '' : `Transaction with nonce ${txNonce} already has a reject transaction`}
          >
            <span style={{ width: '100%' }}>
              <ChoiceButton
                icon={CancelIcon}
                iconColor="warning"
                onClick={() => setTxFlow(<RejectTx txNonce={txNonce} />)}
                disabled={!canCancel}
                title="Reject transaction"
                description="Create a cancellation transaction with the same nonce to avoid security risks"
                chip="Recommended"
              />
            </span>
          </Tooltip>

          {canDelete && (
            <>
              <Typography variant="overline" className={css.or}>
                or
              </Typography>

              <Typography variant="body2" mb={0.5}>
                Don’t want to have this transaction anymore? Remove it permanently from the queue.
              </Typography>

              <ChoiceButton
                icon={DeleteIcon}
                iconColor="error"
                onClick={() => setIsDeleting(true)}
                title="Delete from the queue"
                description="Remove this transaction from the queue permanently"
              />

              {safeTxHash && isDeleting && (
                <DeleteTxModal onSuccess={onDeleteSuccess} onClose={onDeleteClose} safeTxHash={safeTxHash} />
              )}
            </>
          )}
        </Box>
      </TxCard>
    </TxLayout>
  )
}

export default ReplaceTxMenu
