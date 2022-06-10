import { type ReactElement } from 'react'
import type { TokenInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { TokenIcon } from '@/components/common/TokenAmount'
import { createTokenTransferParams } from '@/services/tx/tokenTransferParams'
import { shortenAddress } from '@/services/formatters'
import useBalances from '@/services/useBalances'
import { type SendAssetsFormData } from '@/components/tx/steps/SendAssetsForm'
import useChainId from '@/services/useChainId'
import useSafeAddress from '@/services/useSafeAddress'
import { createTx, dispatchTxProposal, dispatchTxSigning } from '@/services/tx/txSender'
import useWallet from '@/services/wallets/useWallet'
import { ReviewTxForm, ReviewTxFormData } from '@/components/tx/ReviewTxForm'

const TokenTransferReview = ({ params, tokenInfo }: { params: SendAssetsFormData; tokenInfo: TokenInfo }) => {
  return (
    <p>
      Send <TokenIcon logoUri={tokenInfo.logoUri} tokenSymbol={tokenInfo.symbol} />
      {params.amount} {tokenInfo.symbol}
      {' to '}
      {shortenAddress(params.recipient)}
    </p>
  )
}

type ReviewNewTxProps = {
  params: SendAssetsFormData
  onSubmit: (data: null) => void
}

const ReviewNewTx = ({ params, onSubmit }: ReviewNewTxProps): ReactElement => {
  const { balances } = useBalances()
  const safeAddress = useSafeAddress()
  const chainId = useChainId()
  const wallet = useWallet()

  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const tokenInfo = token?.tokenInfo
  const txParams = tokenInfo
    ? createTokenTransferParams(params.recipient, params.amount, tokenInfo.decimals, tokenInfo.address)
    : undefined

  const onFormSubmit = async (data: ReviewTxFormData) => {
    if (!txParams || !wallet?.address) return

    const editedTxParams = {
      ...txParams,
      nonce: data.nonce,
      // Core SDK will ignore safeTxGas for 1.3.0+ Safes
      safeTxGas: data.safeTxGas,
    }

    try {
      const safeTx = await createTx(editedTxParams)
      const signedTx = await dispatchTxSigning(safeTx)
      await dispatchTxProposal(chainId, safeAddress, wallet.address, signedTx)
    } catch {
      return
    }

    onSubmit(null)
  }

  return (
    <ReviewTxForm onFormSubmit={onFormSubmit} txParams={txParams}>
      {tokenInfo ? <TokenTransferReview params={params} tokenInfo={tokenInfo} /> : null}
    </ReviewTxForm>
  )
}

export default ReviewNewTx
