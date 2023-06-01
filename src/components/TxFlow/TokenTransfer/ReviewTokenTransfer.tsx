import { useContext } from 'react'
import { TokenTransferStepper } from '@/components/TxFlow/TokenTransfer/index'
import useBalances from '@/hooks/useBalances'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { TokenTransferReview } from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'
import SendFromBlock from '@/components/tx/SendFromBlock'
import SendToBlock from '@/components/tx/SendToBlock'
import { DialogContent } from '@mui/material'

const ReviewTokenTransfer = () => {
  const { onSubmit, mergedValues } = useContext(TokenTransferStepper.Context)
  const { balances } = useBalances()
  const token = balances.items.find((item) => item.tokenInfo.address === mergedValues.tokenAddress)

  return (
    <DialogContent>
      {token && <TokenTransferReview amount={mergedValues.amount} tokenInfo={token.tokenInfo} />}

      <SendFromBlock />

      <SendToBlock address={mergedValues.recipient} />

      <SignOrExecuteForm onSubmit={() => onSubmit(mergedValues)} />
    </DialogContent>
  )
}

export default ReviewTokenTransfer
