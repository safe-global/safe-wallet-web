import { ReactElement } from 'react'
import { Button, Typography } from '@mui/material'
import { TransactionSummary } from '@gnosis.pm/safe-react-gateway-sdk'

import { rejectTransaction } from '@/services/createTransaction'
import css from './styles.module.css'
import { isMultisigExecutionInfo } from '@/components/transactions/utils'
import { dispatchTxProposal, dispatchTxSigning } from '@/services/txSender'
import useWallet from '@/services/wallets/useWallet'
import useChainId from '@/services/useChainId'
import useSafeAddress from '@/services/useSafeAddress'

const RejectTx = ({ txSummary }: { txSummary: TransactionSummary }): ReactElement => {
  const chainId = useChainId()
  const safeAddress = useSafeAddress()
  const wallet = useWallet()
  const txNonce = isMultisigExecutionInfo(txSummary.executionInfo) ? txSummary.executionInfo.nonce : undefined

  const onReject = async () => {
    if (!txNonce || !wallet?.address) return

    try {
      const rejectTx = await rejectTransaction(txNonce)
      const signedTx = await dispatchTxSigning(rejectTx)
      await dispatchTxProposal(chainId, safeAddress, wallet.address, signedTx)
    } catch (err) {
      // do something
    }
  }

  return (
    <div className={css.container}>
      <Typography variant="h6">Reject Transaction</Typography>

      <Typography>
        This action will reject this transaction. A separate transaction will be performed to submit the rejection.
      </Typography>

      <Typography>
        Transaction nonce <br />
        {txNonce}
      </Typography>

      <Typography>
        You are about to create a rejection transaction and will have to confirm it with your currently connected
        wallet.
      </Typography>

      <div className={css.submit}>
        <Button variant="contained" onClick={onReject}>
          Reject transaction
        </Button>
      </div>
    </div>
  )
}

export default RejectTx
