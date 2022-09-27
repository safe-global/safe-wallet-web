import { type ReactElement, type ReactNode, type SyntheticEvent, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Button, DialogContent, Typography } from '@mui/material'
import type { SafeTransaction } from '@gnosis.pm/safe-core-sdk-types'

import {
  dispatchTxExecution,
  dispatchTxProposal,
  dispatchTxSigning,
  createTx,
  dispatchOnChainSigning,
} from '@/services/tx/txSender'
import useWallet from '@/hooks/wallets/useWallet'
import useGasLimit from '@/hooks/useGasLimit'
import useSafeInfo from '@/hooks/useSafeInfo'
import ErrorMessage from '@/components/tx/ErrorMessage'
import AdvancedParams, { type AdvancedParameters, useAdvancedParams } from '@/components/tx/AdvancedParams'
import { isSmartContractWallet, shouldUseEthSignMethod } from '@/hooks/wallets/wallets'
import DecodedTx from '../DecodedTx'
import ExecuteCheckbox from '../ExecuteCheckbox'
import { logError, Errors } from '@/services/exceptions'
import { AppRoutes } from '@/config/routes'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { useCurrentChain } from '@/hooks/useChains'
import { getTxOptions } from '@/utils/transactions'
import { TxSimulation } from '@/components/tx/TxSimulation'
import { useWeb3 } from '@/hooks/wallets/web3'
import { Web3Provider } from '@ethersproject/providers'

type SignOrExecuteProps = {
  safeTx?: SafeTransaction
  txId?: string
  isExecutable: boolean
  isRejection?: boolean
  onlyExecute?: boolean
  onSubmit: (txId: string) => void
  children?: ReactNode
  error?: Error
  redirectToTx?: boolean
}

const SignOrExecuteForm = ({
  safeTx,
  txId,
  isExecutable,
  isRejection,
  onlyExecute,
  onSubmit,
  children,
  error,
  redirectToTx = true,
}: SignOrExecuteProps): ReactElement => {
  //
  // Hooks & variables
  //
  const [shouldExecute, setShouldExecute] = useState<boolean>(true)
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [tx, setTx] = useState<SafeTransaction | undefined>(safeTx)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  const router = useRouter()
  const { safe, safeAddress } = useSafeInfo()
  const wallet = useWallet()
  const provider = useWeb3()
  const currentChain = useCurrentChain()

  // Check that the transaction is executable
  const canExecute = isExecutable && !!tx && tx.data.nonce === safe.nonce
  // If checkbox is checked and the transaction is executable, execute it, otherwise sign it
  const willExecute = shouldExecute && canExecute

  // Synchronize the tx with the safeTx
  useEffect(() => setTx(safeTx), [safeTx])

  // Estimate gas limit
  const { gasLimit, gasLimitError, gasLimitLoading } = useGasLimit(willExecute ? tx : undefined)

  const [advancedParams, setAdvancedParams] = useAdvancedParams({
    nonce: tx?.data.nonce,
    gasLimit,
    safeTxGas: tx?.data.safeTxGas,
  })

  // Estimating gas
  const isEstimating = willExecute && gasLimitLoading
  // Nonce cannot be edited if the tx is already signed, or it's a rejection
  const nonceReadonly = !!tx?.signatures.size || !!isRejection

  //
  // Callbacks
  //
  const assertSubmittable = (): [ConnectedWallet, SafeTransaction, Web3Provider] => {
    if (!wallet) throw new Error('Wallet not connected')
    if (!tx) throw new Error('Transaction not ready')
    if (!provider) throw new Error('Provider not ready')

    return [wallet, tx, provider]
  }

  // Sign transaction
  const onSign = async (): Promise<string> => {
    const [connectedWallet, createdTx, provider] = assertSubmittable()

    const shouldEthSign = shouldUseEthSignMethod(connectedWallet)
    const smartContractWallet = await isSmartContractWallet(connectedWallet)
    const signedTx = smartContractWallet
      ? await dispatchOnChainSigning(createdTx, provider, txId)
      : await dispatchTxSigning(createdTx, shouldEthSign, txId)

    const proposedTx = await dispatchTxProposal(safe.chainId, safeAddress, connectedWallet.address, signedTx, txId)
    return proposedTx.txId
  }

  // Execute transaction
  const onExecute = async (): Promise<string> => {
    const [connectedWallet, createdTx] = assertSubmittable()

    // If no txId was provided, it's an immediate execution of a new tx
    let id = txId
    if (!id) {
      const proposedTx = await dispatchTxProposal(safe.chainId, safeAddress, connectedWallet.address, createdTx)
      id = proposedTx.txId
    }

    const txOptions = getTxOptions(advancedParams, currentChain)

    await dispatchTxExecution(id, createdTx, txOptions)

    return id
  }

  // On modal submit
  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault()
    setIsSubmittable(false)
    setSubmitError(undefined)

    let id: string
    try {
      id = await (willExecute ? onExecute() : onSign())
    } catch (err) {
      logError(Errors._804, (err as Error).message)
      setIsSubmittable(true)
      setSubmitError(err as Error)
      return
    }

    onSubmit(id)

    // If txId isn't passed in props, it's a newly created tx
    // Redirect to the single tx view
    if (redirectToTx && !txId) {
      router.push({
        pathname: AppRoutes.transactions.tx,
        query: { safe: router.query.safe, id },
      })
    }
  }

  const onAdvancedSubmit = async (data: AdvancedParameters) => {
    // If nonce was edited, create a new with that nonce
    if (tx && (data.nonce !== tx.data.nonce || data.safeTxGas !== tx.data.safeTxGas)) {
      try {
        setTx(await createTx({ ...tx.data, safeTxGas: data.safeTxGas }, data.nonce))
      } catch (err) {
        logError(Errors._103, (err as Error).message)
        return
      }
    }

    setAdvancedParams(data)
  }

  const submitDisabled = !isSubmittable || isEstimating || !tx

  return (
    <form onSubmit={handleSubmit}>
      <DialogContent>
        {children}

        {tx && <DecodedTx tx={tx} txId={txId} />}

        {canExecute && !onlyExecute && <ExecuteCheckbox checked={shouldExecute} onChange={setShouldExecute} />}

        <AdvancedParams
          params={advancedParams}
          recommendedGasLimit={gasLimit}
          recommendedNonce={safeTx?.data.nonce}
          willExecute={willExecute}
          nonceReadonly={nonceReadonly}
          onFormSubmit={onAdvancedSubmit}
        />

        <TxSimulation
          gasLimit={advancedParams.gasLimit?.toNumber()}
          transactions={safeTx}
          canExecute={canExecute}
          disabled={submitDisabled}
        />

        {(error || (willExecute && gasLimitError)) && (
          <ErrorMessage error={error || gasLimitError}>
            This transaction will most likely fail. To save gas costs, avoid creating the transaction.
          </ErrorMessage>
        )}

        {submitError && (
          <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
        )}

        <Typography variant="body2" color="border.main" textAlign="center" mt={3}>
          You&apos;re about to {txId ? '' : 'create and '}
          {willExecute ? 'execute' : 'sign'} a transaction and will need to confirm it with your currently connected
          wallet.
        </Typography>

        <Button variant="contained" type="submit" disabled={submitDisabled}>
          {isEstimating ? 'Estimating...' : 'Submit'}
        </Button>
      </DialogContent>
    </form>
  )
}

export default SignOrExecuteForm
