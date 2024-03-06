import { Box, Button, SvgIcon, Tooltip, Typography } from '@mui/material'

import { SendTokensButton } from '@/components/tx-flow/common/TxButton'
import { useQueuedTxByNonce } from '@/hooks/useTxQueue'
import InfoIcon from '@/public/images/notifications/info.svg'
import ReplaceTxIcon from '@/public/images/transactions/replace-tx.svg'
import { isCustomTxInfo } from '@/utils/transaction-guards'

import TxCard from '@/components/tx-flow/common/TxCard'
import TxLayout from '@/components/tx-flow/common/TxLayout'
import { useContext } from 'react'
import { TxModalContext } from '../..'
import RejectTx from '../RejectTx'
import TokenTransferFlow from '../TokenTransfer'
import css from './styles.module.css'

// TODO: Move this to the status widget
/*

const wrapIcon = (icon: React.ReactNode) => <div data-sid="48520" className={css.circle}>{icon}</div>
const steps = [
  {
    label: 'Create new transaction with same nonce',
    icon: <div data-sid="11520" className={css.redCircle} />,
  },
  {
    label: 'Collect confirmations from owners',
    icon: wrapIcon(<CheckIcon fontSize="small" color="border" />),
  },
  {
    label: 'Execute replacement transaction',
    icon: wrapIcon(<SvgIcon component={RocketIcon} inheritViewBox fontSize="small" color="border" />),
  },
  {
    label: 'Initial transaction is replaced',
    icon: wrapIcon(<SvgIcon component={DeleteIcon} inheritViewBox fontSize="small" color="border" />),
  },
]
 */

const btnWidth = {
  width: {
    xs: 240,
    sm: '100%',
  },
}

const ReplaceTxMenu = ({ txNonce }: { txNonce: number }) => {
  const { setTxFlow } = useContext(TxModalContext)
  const queuedTxsByNonce = useQueuedTxByNonce(txNonce)
  const canCancel = !queuedTxsByNonce?.some(
    (item) => isCustomTxInfo(item.transaction.txInfo) && item.transaction.txInfo.isCancellation,
  )

  return (
    <TxLayout title="Replace transaction" step={0} hideNonce isReplacement>
      <TxCard>
        <Box data-sid="80211" my={4} textAlign="center">
          <ReplaceTxIcon />
        </Box>
        <Typography variant="h4" fontWeight="700" textAlign="center">
          Select how you would like to replace this transaction
        </Typography>
        <Typography variant="body1" textAlign="center">
          A signed transaction cannot be removed but it can be replaced with a new transaction with the same nonce.
        </Typography>

        <div data-sid="11824" className={css.buttons}>
          <div>
            <SendTokensButton onClick={() => setTxFlow(<TokenTransferFlow txNonce={txNonce} />)} sx={btnWidth} />
          </div>

          <Typography variant="body2" className={css.or}>
            or
          </Typography>

          <div data-sid="60000" className={css.rejectButton}>
            <Tooltip
              arrow
              placement="top"
              title={canCancel ? '' : `Transaction with nonce ${txNonce} already has a reject transaction`}
            >
              <span style={{ width: '100%' }}>
                <Button
                  data-sid="24846"
                  onClick={() => setTxFlow(<RejectTx txNonce={txNonce} />)}
                  variant="outlined"
                  fullWidth
                  sx={btnWidth}
                  disabled={!canCancel}
                >
                  Reject transaction
                </Button>
              </span>
            </Tooltip>

            <Tooltip
              title={`An on-chain rejection doesn't send any funds. Executing an on-chain rejection will replace all currently awaiting transactions with nonce ${txNonce}.`}
              arrow
            >
              <span className={css.rejectHint}>
                <SvgIcon
                  component={InfoIcon}
                  inheritViewBox
                  fontSize="small"
                  color="border"
                  sx={{ display: 'block' }}
                />
              </span>
            </Tooltip>
          </div>
        </div>
      </TxCard>
    </TxLayout>
  )
}

export default ReplaceTxMenu
