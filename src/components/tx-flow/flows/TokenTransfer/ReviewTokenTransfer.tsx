import { useContext, useEffect } from 'react'
import useBalances from '@/hooks/useBalances'
import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { TokenTransferReview } from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'
import SendFromBlock from '@/components/tx/SendFromBlock'
import SendToBlock from '@/components/tx/SendToBlock'
import { DialogContent } from '@mui/material'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import { createTx } from '@/services/tx/tx-sender'
import type { TokenTransferParams } from '.'
import { SafeTxContext } from '../../SafeTxProvider'

const ReviewTokenTransfer = ({ params, onSubmit }: { params: TokenTransferParams; onSubmit: () => void }) => {
  const { setSafeTx, setSafeTxError, setNonce } = useContext(SafeTxContext)
  const { balances } = useBalances()
  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)

  useEffect(() => {
    if (!token) return

    const txParams = createTokenTransferParams(
      params.recipient || '',
      params.amount || '',
      token.tokenInfo.decimals,
      token.tokenInfo.address,
    )

    if (params.txNonce) {
      setNonce(params.txNonce)
    }

    createTx(txParams, params.txNonce).then(setSafeTx).catch(setSafeTxError)
  }, [params, token, setNonce, setSafeTx, setSafeTxError])

  return (
    <DialogContent>
      {token && <TokenTransferReview amount={params.amount || ''} tokenInfo={token.tokenInfo} />}

      <SendFromBlock />

      <SendToBlock address={params.recipient || ''} />

      <SignOrExecuteForm onSubmit={onSubmit} />
    </DialogContent>
  )
}

export default ReviewTokenTransfer
