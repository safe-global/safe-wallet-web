import type { ReactElement, SyntheticEvent } from 'react'
import { useMemo, useState } from 'react'
import type { BigNumberish, BytesLike } from 'ethers'
import { Button, DialogContent, Typography } from '@mui/material'
import SendFromBlock from '@/components/tx/SendFromBlock'
import SendToBlock from '@/components/tx/SendToBlock'
import type { TokenTransferModalProps } from '.'
import { TokenTransferReview } from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'
import useBalances from '@/hooks/useBalances'
import useSpendingLimit from '@/hooks/useSpendingLimit'
import useSpendingLimitGas from '@/hooks/useSpendingLimitGas'
import AdvancedParams, { useAdvancedParams } from '@/components/tx/AdvancedParams'
import { parseUnits } from '@ethersproject/units'
import { EMPTY_DATA, ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { useCurrentChain } from '@/hooks/useChains'
import { dispatchSpendingLimitTxExecution } from '@/services/tx/tx-sender'
import { getTxOptions } from '@/utils/transactions'
import { MODALS_EVENTS, trackEvent } from '@/services/analytics'
import useOnboard from '@/hooks/wallets/useOnboard'
import { WrongChainWarning } from '@/components/tx/WrongChainWarning'

export type SpendingLimitTxParams = {
  safeAddress: string
  token: string
  to: string
  amount: BigNumberish
  paymentToken: string
  payment: BigNumberish
  delegate: string
  signature: BytesLike
}

const ReviewSpendingLimitTx = ({ params, onSubmit }: TokenTransferModalProps): ReactElement => {
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const currentChain = useCurrentChain()
  const onboard = useOnboard()
  const { safe, safeAddress } = useSafeInfo()
  const { balances } = useBalances()
  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const spendingLimit = useSpendingLimit(token?.tokenInfo)

  const txParams: SpendingLimitTxParams = useMemo(
    () => ({
      safeAddress,
      token: spendingLimit?.token.address || ZERO_ADDRESS,
      to: params.recipient,
      amount: parseUnits(params.amount, token?.tokenInfo.decimals).toString(),
      paymentToken: ZERO_ADDRESS,
      payment: 0,
      delegate: spendingLimit?.beneficiary || ZERO_ADDRESS,
      signature: EMPTY_DATA,
    }),
    [
      params.amount,
      params.recipient,
      safeAddress,
      spendingLimit?.beneficiary,
      spendingLimit?.token,
      token?.tokenInfo.decimals,
    ],
  )

  const { gasLimit, gasLimitLoading } = useSpendingLimitGas(txParams)

  const [advancedParams, setManualParams] = useAdvancedParams({
    gasLimit,
    nonce: params.txNonce,
  })

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    if (!onboard) return

    trackEvent(MODALS_EVENTS.USE_SPENDING_LIMIT)

    setIsSubmittable(false)
    setSubmitError(undefined)

    const txOptions = getTxOptions(advancedParams, currentChain)

    try {
      await dispatchSpendingLimitTxExecution(txParams, txOptions, onboard, safe.chainId, safeAddress)

      onSubmit()
    } catch (err) {
      logError(Errors._801, (err as Error).message)
      setIsSubmittable(true)
      setSubmitError(err as Error)
    }
  }

  const submitDisabled = !isSubmittable || gasLimitLoading

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        <Typography variant="body2" mb={4}>
          Spending limit transactions only appear in the interface once they are successfully processed and indexed.
          Pending transactions can only be viewed in your signer wallet application or under your wallet address on a
          Blockchain Explorer.
        </Typography>
        {token && <TokenTransferReview amount={params.amount} tokenInfo={token.tokenInfo} />}

        <SendFromBlock />

        <SendToBlock address={params.recipient} />

        <AdvancedParams
          params={advancedParams}
          willExecute={true}
          nonceReadonly={false}
          onFormSubmit={setManualParams}
        />

        <WrongChainWarning />

        {submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )}

        <Typography variant="body2" color="primary.light" textAlign="center" mt={3}>
          You&apos;re about to create a transaction and will need to confirm it with your currently connected wallet.
        </Typography>

        <Button variant="contained" type="submit" disabled={submitDisabled}>
          Submit
        </Button>
      </DialogContent>
    </form>
  )
}

export default ReviewSpendingLimitTx
