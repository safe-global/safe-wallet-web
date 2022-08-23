import { ReactElement, SyntheticEvent, useMemo, useState } from 'react'
import { BigNumberish, BytesLike } from 'ethers'
import { Box, Button, DialogContent, Typography } from '@mui/material'
import SendFromBlock from '@/components/tx/SendFromBlock'
import EthHashInfo from '@/components/common/EthHashInfo'
import { ReviewTokenTxProps, TokenTransferReview } from '@/components/tx/modals/TokenTransferModal/ReviewTokenTx'
import useBalances from '@/hooks/useBalances'
import useSpendingLimit from '@/hooks/useSpendingLimit'
import useSpendingLimitGas from '@/hooks/useSpendingLimitGas'
import AdvancedParams, { useAdvancedParams } from '@/components/tx/AdvancedParams'
import { getSpendingLimitContract } from '@/services/contracts/spendingLimitContracts'
import useChainId from '@/hooks/useChainId'
import { useWeb3 } from '@/hooks/wallets/web3'
import { parseUnits } from '@ethersproject/units'
import { EMPTY_DATA, ZERO_ADDRESS } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import useSafeInfo from '@/hooks/useSafeInfo'
import { Errors, logError } from '@/services/exceptions'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { TransactionOptions } from '@gnosis.pm/safe-core-sdk-types'
import { hasFeature } from '@/utils/chains'
import { FEATURES } from '@gnosis.pm/safe-react-gateway-sdk'
import { useCurrentChain } from '@/hooks/useChains'

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

const ReviewSpendingLimitTx = ({ params, onSubmit }: ReviewTokenTxProps): ReactElement => {
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const chainId = useChainId()
  const currentChain = useCurrentChain()
  const provider = useWeb3()
  const { safeAddress } = useSafeInfo()
  const { balances } = useBalances()
  const token = balances.items.find((item) => item.tokenInfo.address === params.tokenAddress)
  const spendingLimit = useSpendingLimit(token?.tokenInfo)

  const txParams: SpendingLimitTxParams = useMemo(
    () => ({
      safeAddress,
      token: spendingLimit?.token || ZERO_ADDRESS,
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

  const { gasLimit, loading } = useSpendingLimitGas(txParams)

  const [advancedParams, setManualParams] = useAdvancedParams({ gasLimit })

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setIsSubmittable(false)
    setSubmitError(undefined)

    if (!provider || !spendingLimit) return

    const contract = getSpendingLimitContract(chainId, provider.getSigner())

    const txOptions = {
      gasLimit: advancedParams.gasLimit?.toString(),
      maxFeePerGas: advancedParams.maxFeePerGas?.toString(),
      maxPriorityFeePerGas: advancedParams.maxPriorityFeePerGas?.toString(),
      nonce: advancedParams.userNonce?.toString(),
    } as TransactionOptions // @FIXME: this is a workaround until Core SDK adds nonce

    // Some chains don't support EIP-1559 gas price params
    if (currentChain && !hasFeature(currentChain, FEATURES.EIP1559)) {
      txOptions.gasPrice = txOptions.maxFeePerGas
      delete txOptions.maxFeePerGas
      delete txOptions.maxPriorityFeePerGas
    }

    try {
      await contract.executeAllowanceTransfer(
        txParams.safeAddress,
        txParams.token,
        txParams.to,
        txParams.amount,
        txParams.paymentToken,
        txParams.payment,
        txParams.delegate,
        txParams.signature,
        txOptions,
      )

      onSubmit(null)
    } catch (err) {
      logError(Errors._801, (err as Error).message)
      setIsSubmittable(true)
      setSubmitError(err as Error)
    }
  }

  const submitDisabled = !isSubmittable || loading

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        <Typography variant="body2" mb={4}>
          Spending limit transactions only appear in the interface once they are successfully mined and indexed. Pending
          transactions can only be viewed in your signer wallet application or under your owner wallet address through a
          Blockchain Explorer.
        </Typography>
        {token && <TokenTransferReview amount={params.amount} tokenInfo={token.tokenInfo} />}

        <SendFromBlock />

        <Typography color={({ palette }) => palette.text.secondary} pb={1}>
          Recipient
        </Typography>

        <Box mb={3}>
          <EthHashInfo address={params.recipient} shortAddress={false} hasExplorer showCopyButton />
        </Box>

        <AdvancedParams
          params={advancedParams}
          willExecute={true}
          nonceReadonly={false}
          onFormSubmit={setManualParams}
        />

        {submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )}

        <Typography variant="body2" color="secondary.light" textAlign="center" mt={3}>
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
