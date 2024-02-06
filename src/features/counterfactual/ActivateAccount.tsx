import { createNewSafe, relaySafeCreation } from '@/components/new-safe/create/logic'
import NetworkWarning from '@/components/new-safe/create/NetworkWarning'
import { NetworkFee, SafeSetupOverview } from '@/components/new-safe/create/steps/ReviewStep'
import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import ReviewRow from '@/components/new-safe/ReviewRow'
import { TxModalContext } from '@/components/tx-flow'
import TxCard from '@/components/tx-flow/common/TxCard'

import TxLayout from '@/components/tx-flow/common/TxLayout'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { ExecutionMethod, ExecutionMethodSelector } from '@/components/tx/ExecutionMethodSelector'
import useDeployGasLimit from '@/features/counterfactual/hooks/useDeployGasLimit'
import { removeUndeployedSafe, selectUndeployedSafe } from '@/features/counterfactual/store/undeployedSafesSlice'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import useGasPrice, { getTotalFeeFormatted } from '@/hooks/useGasPrice'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { useLeastRemainingRelays } from '@/hooks/useRemainingRelays'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWalletCanPay from '@/hooks/useWalletCanPay'
import useWallet from '@/hooks/wallets/useWallet'
import { useWeb3 } from '@/hooks/wallets/web3'
import { asError } from '@/services/exceptions/utils'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import { waitForCreateSafeTx } from '@/services/tx/txMonitor'
import { useAppDispatch, useAppSelector } from '@/store'
import { hasFeature } from '@/utils/chains'
import { hasRemainingRelays } from '@/utils/relaying'
import { Alert, Box, Button, CircularProgress, Divider, Grid, Typography } from '@mui/material'
import type { DeploySafeProps } from '@safe-global/protocol-kit'
import { FEATURES } from '@safe-global/safe-gateway-typescript-sdk'
import React, { useContext, useState } from 'react'

const useActivateAccount = () => {
  const chain = useCurrentChain()
  const [gasPrice] = useGasPrice()
  const { gasLimit } = useDeployGasLimit()

  const isEIP1559 = chain && hasFeature(chain, FEATURES.EIP1559)
  const maxFeePerGas = gasPrice?.maxFeePerGas
  const maxPriorityFeePerGas = gasPrice?.maxPriorityFeePerGas

  const options: DeploySafeProps['options'] = isEIP1559
    ? {
        maxFeePerGas: maxFeePerGas?.toString(),
        maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
        gasLimit: gasLimit?.toString(),
      }
    : { gasPrice: maxFeePerGas?.toString(), gasLimit: gasLimit?.toString() }

  const totalFee = getTotalFeeFormatted(maxFeePerGas, maxPriorityFeePerGas, gasLimit, chain)
  const walletCanPay = useWalletCanPay({ gasLimit, maxFeePerGas, maxPriorityFeePerGas })

  return { options, totalFee, walletCanPay }
}

const ActivateAccountFlow = () => {
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()
  const [executionMethod, setExecutionMethod] = useState(ExecutionMethod.RELAY)

  const isWrongChain = useIsWrongChain()
  const chain = useCurrentChain()
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()
  const provider = useWeb3()
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, chainId, safeAddress))
  const { setTxFlow } = useContext(TxModalContext)
  const dispatch = useAppDispatch()
  const wallet = useWallet()
  const { options, totalFee, walletCanPay } = useActivateAccount()

  const ownerAddresses = undeployedSafe?.safeAccountConfig.owners || []
  const [minRelays] = useLeastRemainingRelays(ownerAddresses)

  // Every owner has remaining relays and relay method is selected
  const canRelay = hasRemainingRelays(minRelays)
  const willRelay = canRelay && executionMethod === ExecutionMethod.RELAY

  if (!undeployedSafe) return null

  const onSuccess = () => {
    dispatch(removeUndeployedSafe({ chainId, address: safeAddress }))
  }

  const createSafe = async () => {
    if (!provider || !chain) return

    setIsSubmittable(false)
    setSubmitError(undefined)

    try {
      if (willRelay) {
        const taskId = await relaySafeCreation(
          chain,
          undeployedSafe.safeAccountConfig.owners,
          undeployedSafe.safeAccountConfig.threshold,
          Number(undeployedSafe.safeDeploymentConfig?.saltNonce!),
        )

        waitForCreateSafeTx(taskId, (status) => {
          if (status === SafeCreationStatus.SUCCESS) {
            onSuccess()
          }
        })
      } else {
        await createNewSafe(provider, {
          safeAccountConfig: undeployedSafe.safeAccountConfig,
          saltNonce: undeployedSafe.safeDeploymentConfig?.saltNonce,
          options,
        })
        onSuccess()
      }
    } catch (_err) {
      const err = asError(_err)
      setIsSubmittable(true)
      setSubmitError(err)
      return
    }

    setTxFlow(undefined)
  }

  const submitDisabled = !isSubmittable
  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  return (
    <TxLayout title="Activate account" hideNonce>
      <TxCard>
        <Typography>
          You&apos;re about to deploy this Safe Account and will have to confirm the transaction with your connected
          wallet.
        </Typography>

        <Divider sx={{ mx: -3, my: 2 }} />

        <SafeSetupOverview
          owners={undeployedSafe.safeAccountConfig.owners.map((owner) => ({ name: '', address: owner }))}
          threshold={undeployedSafe.safeAccountConfig.threshold}
        />

        <Divider sx={{ mx: -3, mt: 2, mb: 1 }} />
        <Box display="flex" flexDirection="column" gap={3}>
          {canRelay && !isSocialLogin && (
            <Grid container spacing={3}>
              <ReviewRow
                name="Execution method"
                value={
                  <ExecutionMethodSelector
                    executionMethod={executionMethod}
                    setExecutionMethod={setExecutionMethod}
                    relays={minRelays}
                  />
                }
              />
            </Grid>
          )}

          <Grid data-testid="network-fee-section" container spacing={3}>
            <ReviewRow
              name="Est. network fee"
              value={
                <>
                  <NetworkFee totalFee={totalFee} willRelay={willRelay} chain={chain} />

                  {!willRelay && !isSocialLogin && (
                    <Typography variant="body2" color="text.secondary" mt={1}>
                      You will have to confirm a transaction with your connected wallet.
                    </Typography>
                  )}
                </>
              }
            />
          </Grid>

          {submitError && (
            <Box mt={1}>
              <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
            </Box>
          )}

          {isWrongChain && <NetworkWarning />}

          {!walletCanPay && !willRelay && (
            <ErrorMessage>
              Your connected wallet doesn&apos;t have enough funds to execute this transaction
            </ErrorMessage>
          )}
        </Box>

        <Divider sx={{ mx: -3, mt: 2, mb: 1 }} />

        <Box display="flex" flexDirection="row" justifyContent="flex-end" gap={3}>
          <Button onClick={createSafe} variant="contained" size="stretched" disabled={submitDisabled}>
            {!isSubmittable ? <CircularProgress size={20} /> : 'Activate'}
          </Button>
        </Box>
      </TxCard>
    </TxLayout>
  )
}

const ActivateAccount = () => {
  const { safe } = useSafeInfo()
  const { setTxFlow } = useContext(TxModalContext)

  if (safe.deployed) return null

  const activateAccount = () => {
    setTxFlow(<ActivateAccountFlow />)
  }

  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      <Typography fontWeight="bold">Activate your account?</Typography>
      <Typography variant="body2" mb={3}>
        Activate your account now by deploying it and paying a network fee.
      </Typography>
      <Button variant="contained" size="small" onClick={activateAccount}>
        Activate now
      </Button>
    </Alert>
  )
}

export default ActivateAccount
