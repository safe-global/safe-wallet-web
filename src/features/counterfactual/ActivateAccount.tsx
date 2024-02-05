import ChainIndicator from '@/components/common/ChainIndicator'
import EthHashInfo from '@/components/common/EthHashInfo'
import { createNewSafe } from '@/components/new-safe/create/logic'
import { NetworkFee } from '@/components/new-safe/create/steps/ReviewStep'
import css from '@/components/new-safe/create/steps/ReviewStep/styles.module.css'
import ReviewRow from '@/components/new-safe/ReviewRow'
import { TxModalContext } from '@/components/tx-flow'
import TxCard from '@/components/tx-flow/common/TxCard'
import ErrorMessage from '@/components/tx/ErrorMessage'
import useDeployGasLimit from '@/features/counterfactual/hooks/useDeployGasLimit'
import { removeUndeployedSafe, selectUndeployedSafe } from '@/features/counterfactual/store/undeployedSafeSlice'
import useChainId from '@/hooks/useChainId'
import { useCurrentChain } from '@/hooks/useChains'
import useGasPrice, { getTotalFee } from '@/hooks/useGasPrice'
import useSafeInfo from '@/hooks/useSafeInfo'
import { useWeb3 } from '@/hooks/wallets/web3'
import { asError } from '@/services/exceptions/utils'
import { useAppDispatch, useAppSelector } from '@/store'
import { hasFeature } from '@/utils/chains'
import { formatVisualAmount } from '@/utils/formatters'
import { Alert, Box, Button, CircularProgress, Divider, Grid, Typography } from '@mui/material'
import type { DeploySafeProps } from '@safe-global/protocol-kit'
import { FEATURES } from '@safe-global/safe-gateway-typescript-sdk'
import React, { useContext, useState } from 'react'

import TxLayout from '@/components/tx-flow/common/TxLayout'

const ActivateAccountFlow = () => {
  const [isSubmittable, setIsSubmittable] = useState<boolean>(true)
  const [submitError, setSubmitError] = useState<Error | undefined>()

  const chain = useCurrentChain()
  const chainId = useChainId()
  const { safeAddress } = useSafeInfo()
  const provider = useWeb3()
  const undeployedSafe = useAppSelector((state) => selectUndeployedSafe(state, chainId, safeAddress))
  const { setTxFlow } = useContext(TxModalContext)
  const dispatch = useAppDispatch()

  const { gasLimit } = useDeployGasLimit()
  const [gasPrice] = useGasPrice()

  if (!undeployedSafe) return null

  const isEIP1559 = chain && hasFeature(chain, FEATURES.EIP1559)
  const maxFeePerGas = gasPrice?.maxFeePerGas
  const maxPriorityFeePerGas = gasPrice?.maxPriorityFeePerGas

  const totalFee =
    gasLimit && maxFeePerGas
      ? formatVisualAmount(getTotalFee(maxFeePerGas, maxPriorityFeePerGas, gasLimit), chain?.nativeCurrency.decimals)
      : '> 0.001'

  const createSafe = async () => {
    if (!provider) return

    setIsSubmittable(false)
    setSubmitError(undefined)

    try {
      const options: DeploySafeProps['options'] = isEIP1559
        ? {
            maxFeePerGas: maxFeePerGas?.toString(),
            maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
            gasLimit: gasLimit?.toString(),
          }
        : { gasPrice: maxFeePerGas?.toString(), gasLimit: gasLimit?.toString() }

      await createNewSafe(provider, {
        safeAccountConfig: undeployedSafe.safeAccountConfig,
        saltNonce: undeployedSafe.safeDeploymentConfig?.saltNonce,
        options,
      })
      dispatch(removeUndeployedSafe({ chainId, address: safeAddress }))
    } catch (_err) {
      const err = asError(_err)
      setIsSubmittable(true)
      setSubmitError(err)
      return
    }

    setTxFlow(undefined)
  }

  const submitDisabled = !isSubmittable

  return (
    <TxLayout title="Activate account" hideNonce>
      <TxCard>
        <Typography>
          You&apos;re about to deploy this Safe Account and will have to confirm the transaction with your connected
          wallet.
        </Typography>

        <Divider sx={{ mx: -3, my: 2 }} />

        <Grid container spacing={3}>
          <ReviewRow name="Network" value={<ChainIndicator chainId={chain?.chainId} inline />} />
          <ReviewRow
            name="Owners"
            value={
              <Box data-testid="review-step-owner-info" className={css.ownersArray}>
                {undeployedSafe.safeAccountConfig.owners.map((owner, index) => (
                  <EthHashInfo
                    address={owner}
                    shortAddress={false}
                    showPrefix={false}
                    showName
                    hasExplorer
                    showCopyButton
                    key={index}
                  />
                ))}
              </Box>
            }
          />
          <ReviewRow
            name="Threshold"
            value={
              <Typography>
                {undeployedSafe.safeAccountConfig.threshold} out of {undeployedSafe.safeAccountConfig.owners.length}{' '}
                owner(s)
              </Typography>
            }
          />
        </Grid>

        <Divider sx={{ mx: -3, my: 2 }} />

        <Grid container spacing={3}>
          <ReviewRow
            name="Est. network fee"
            value={
              <>
                <NetworkFee totalFee={totalFee} willRelay={false} chain={chain} />

                <Typography variant="body2" color="text.secondary" mt={1}>
                  You will have to confirm a transaction with your connected wallet.
                </Typography>
              </>
            }
          />
        </Grid>

        {submitError && (
          <Box mt={1}>
            <ErrorMessage error={submitError}>Error submitting the transaction. Please try again.</ErrorMessage>
          </Box>
        )}

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
      <Typography fontWeight="bold">Want to skip onboarding?</Typography>
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
