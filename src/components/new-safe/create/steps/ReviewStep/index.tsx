import type { NamedAddress } from '@/components/new-safe/create/types'
import EthHashInfo from '@/components/common/EthHashInfo'
import { safeCreationDispatch, SafeCreationEvent } from '@/features/counterfactual/services/safeCreationEvents'
import { getTotalFeeFormatted } from '@/hooks/useGasPrice'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { NewSafeFormData } from '@/components/new-safe/create'
import {
  computeNewSafeAddress,
  createNewSafe,
  relaySafeCreation,
  SAFE_TO_L2_SETUP_ADDRESS,
  SAFE_TO_L2_SETUP_INTERFACE,
} from '@/components/new-safe/create/logic'
import { getAvailableSaltNonce } from '@/components/new-safe/create/logic/utils'
import css from '@/components/new-safe/create/steps/ReviewStep/styles.module.css'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import { useEstimateSafeCreationGas } from '@/components/new-safe/create/useEstimateSafeCreationGas'
import useSyncSafeCreationStep from '@/components/new-safe/create/useSyncSafeCreationStep'
import ReviewRow from '@/components/new-safe/ReviewRow'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { ExecutionMethod, ExecutionMethodSelector } from '@/components/tx/ExecutionMethodSelector'
import PayNowPayLater, { PayMethod } from '@/features/counterfactual/PayNowPayLater'
import { CF_TX_GROUP_KEY, createCounterfactualSafe } from '@/features/counterfactual/utils'
import { useCurrentChain, useHasFeature } from '@/hooks/useChains'
import useGasPrice from '@/hooks/useGasPrice'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { useLeastRemainingRelays } from '@/hooks/useRemainingRelays'
import useWalletCanPay from '@/hooks/useWalletCanPay'
import useWallet from '@/hooks/wallets/useWallet'
import { CREATE_SAFE_CATEGORY, CREATE_SAFE_EVENTS, OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { gtmSetSafeAddress } from '@/services/analytics/gtm'
import { getReadOnlyFallbackHandlerContract } from '@/services/contracts/safeContracts'
import { asError } from '@/services/exceptions/utils'
import { useAppDispatch, useAppSelector } from '@/store'
import { FEATURES, hasFeature } from '@/utils/chains'
import { hasRemainingRelays } from '@/utils/relaying'
import { isWalletRejection } from '@/utils/wallets'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Button, CircularProgress, Divider, Grid, Typography } from '@mui/material'
import { type DeploySafeProps } from '@safe-global/protocol-kit'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import classnames from 'classnames'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { getSafeL2SingletonDeployment } from '@safe-global/safe-deployments'
import { ECOSYSTEM_ID_ADDRESS } from '@/config/constants'
import ChainIndicator from '@/components/common/ChainIndicator'
import NetworkWarning from '../../NetworkWarning'
import useAllSafes from '@/components/welcome/MyAccounts/useAllSafes'
import { uniq } from 'lodash'
import { selectRpc } from '@/store/settingsSlice'
import { AppRoutes } from '@/config/routes'

export const NetworkFee = ({
  totalFee,
  chain,
  willRelay,
  inline = false,
}: {
  totalFee: string
  chain: ChainInfo | undefined
  willRelay: boolean
  inline?: boolean
}) => {
  return (
    <Box className={classnames(css.networkFee, { [css.networkFeeInline]: inline })}>
      <Typography className={classnames({ [css.sponsoredFee]: willRelay })}>
        <b>
          &asymp; {totalFee} {chain?.nativeCurrency.symbol}
        </b>
      </Typography>
    </Box>
  )
}

export const SafeSetupOverview = ({
  name,
  owners,
  threshold,
  networks,
}: {
  name?: string
  owners: NamedAddress[]
  threshold: number
  networks: ChainInfo[]
}) => {
  const chain = useCurrentChain()

  return (
    <Grid container spacing={3}>
      <ReviewRow
        name={networks.length > 1 ? 'Networks' : 'Network'}
        value={
          <Box display="flex" flexWrap="wrap" gap={1}>
            {networks.map((network) => (
              <ChainIndicator inline key={network.chainId} chainId={network.chainId} showUnknown={false} />
            ))}
          </Box>
        }
      />
      {name && <ReviewRow name="Name" value={<Typography>{name}</Typography>} />}
      <ReviewRow
        name="Signers"
        value={
          <Box data-testid="review-step-owner-info" className={css.ownersArray}>
            {owners.map((owner, index) => (
              <EthHashInfo
                address={owner.address}
                name={owner.name || owner.ens}
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
            {threshold} out of {owners.length} signer(s)
          </Typography>
        }
      />
    </Grid>
  )
}

const ReviewStep = ({ data, onSubmit, onBack, setStep }: StepRenderProps<NewSafeFormData>) => {
  const isWrongChain = useIsWrongChain()
  useSyncSafeCreationStep(setStep, data.networks)
  const chain = useCurrentChain()
  const wallet = useWallet()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [gasPrice] = useGasPrice()
  const [payMethod, setPayMethod] = useState(PayMethod.PayLater)
  const [executionMethod, setExecutionMethod] = useState(ExecutionMethod.RELAY)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string>()
  const isCounterfactualEnabled = useHasFeature(FEATURES.COUNTERFACTUAL)
  const isEIP1559 = chain && hasFeature(chain, FEATURES.EIP1559)

  const ownerAddresses = useMemo(() => data.owners.map((owner) => owner.address), [data.owners])
  const [minRelays] = useLeastRemainingRelays(ownerAddresses)

  const isMultiChainDeployment = data.networks.length > 1

  // Every owner has remaining relays and relay method is selected
  const canRelay = hasRemainingRelays(minRelays)
  const willRelay = canRelay && executionMethod === ExecutionMethod.RELAY

  const safeParams = useMemo(() => {
    return {
      owners: data.owners.map((owner) => owner.address),
      threshold: data.threshold,
      saltNonce: Date.now(), // This is not the final saltNonce but easier to use and will only result in a slightly higher gas estimation
    }
  }, [data.owners, data.threshold])

  const { gasLimit } = useEstimateSafeCreationGas(safeParams, data.safeVersion)

  const maxFeePerGas = gasPrice?.maxFeePerGas
  const maxPriorityFeePerGas = gasPrice?.maxPriorityFeePerGas

  const walletCanPay = useWalletCanPay({ gasLimit, maxFeePerGas, maxPriorityFeePerGas })

  const totalFee = getTotalFeeFormatted(maxFeePerGas, gasLimit, chain)

  const allSafes = useAllSafes()
  const knownAddresses = useMemo(() => uniq(allSafes?.map((safe) => safe.address)), [allSafes])

  const customRPCs = useAppSelector(selectRpc)

  const handleBack = () => {
    onBack(data)
  }

  const handleCreateSafeClick = async () => {
    try {
      if (!wallet || !chain) return

      setIsCreating(true)

      // Create universal deployment Data across chains:
      const readOnlyFallbackHandlerContract = await getReadOnlyFallbackHandlerContract(data.safeVersion)
      const safeL2Deployment = getSafeL2SingletonDeployment({ version: data.safeVersion, network: chain.chainId })
      const safeL2Address = safeL2Deployment?.defaultAddress
      if (!safeL2Address) {
        throw new Error('No Safe deployment found')
      }

      const props: DeploySafeProps = {
        safeAccountConfig: {
          threshold: data.threshold,
          owners: data.owners.map((owner) => owner.address),
          fallbackHandler: await readOnlyFallbackHandlerContract.getAddress(),
          to: SAFE_TO_L2_SETUP_ADDRESS,
          data: SAFE_TO_L2_SETUP_INTERFACE.encodeFunctionData('setupToL2', [safeL2Address]),
          paymentReceiver: ECOSYSTEM_ID_ADDRESS,
        },
      }
      // Figure out the shared available nonce across chains
      const nextAvailableNonce = await getAvailableSaltNonce(
        customRPCs,
        { ...props, saltNonce: data.saltNonce.toString() },
        data.networks,
        knownAddresses,
        data.safeVersion,
      )

      const safeAddress = await computeNewSafeAddress(
        wallet.provider,
        { ...props, saltNonce: nextAvailableNonce },
        chain,
        data.safeVersion,
      )

      for (const network of data.networks) {
        createSafe(network, props, safeAddress, nextAvailableNonce)
      }

      if (isCounterfactualEnabled && payMethod === PayMethod.PayLater) {
        router?.push({
          pathname: AppRoutes.home,
          query: { safe: `${data.networks[0].shortName}:${safeAddress}` },
        })
        safeCreationDispatch(SafeCreationEvent.AWAITING_EXECUTION, {
          groupKey: CF_TX_GROUP_KEY,
          safeAddress,
          networks: data.networks,
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsCreating(false)
    }
  }

  const createSafe = async (chain: ChainInfo, props: DeploySafeProps, safeAddress: string, saltNonce: string) => {
    if (!wallet) return

    try {
      if (isCounterfactualEnabled && payMethod === PayMethod.PayLater) {
        gtmSetSafeAddress(safeAddress)

        trackEvent({ ...OVERVIEW_EVENTS.PROCEED_WITH_TX, label: 'counterfactual', category: CREATE_SAFE_CATEGORY })
        createCounterfactualSafe(chain, safeAddress, saltNonce, data, dispatch, props, PayMethod.PayLater, router)
        trackEvent({ ...CREATE_SAFE_EVENTS.CREATED_SAFE, label: 'counterfactual' })
        return
      }

      const options: DeploySafeProps['options'] = isEIP1559
        ? {
            maxFeePerGas: maxFeePerGas?.toString(),
            maxPriorityFeePerGas: maxPriorityFeePerGas?.toString(),
            gasLimit: gasLimit?.toString(),
          }
        : { gasPrice: maxFeePerGas?.toString(), gasLimit: gasLimit?.toString() }

      const onSubmitCallback = async (taskId?: string, txHash?: string) => {
        // Create a counterfactual Safe
        createCounterfactualSafe(chain, safeAddress, saltNonce, data, dispatch, props, PayMethod.PayNow)

        if (taskId) {
          safeCreationDispatch(SafeCreationEvent.RELAYING, { groupKey: CF_TX_GROUP_KEY, taskId, safeAddress })
        }

        if (txHash) {
          safeCreationDispatch(SafeCreationEvent.PROCESSING, {
            groupKey: CF_TX_GROUP_KEY,
            txHash,
            safeAddress,
          })
        }

        trackEvent(CREATE_SAFE_EVENTS.SUBMIT_CREATE_SAFE)
        trackEvent({ ...OVERVIEW_EVENTS.PROCEED_WITH_TX, label: 'deployment', category: CREATE_SAFE_CATEGORY })

        onSubmit(data)
      }

      if (willRelay) {
        const taskId = await relaySafeCreation(
          chain,
          props.safeAccountConfig.owners,
          props.safeAccountConfig.threshold,
          Number(saltNonce),
          data.safeVersion,
        )
        onSubmitCallback(taskId)
      } else {
        await createNewSafe(
          wallet.provider,
          {
            safeAccountConfig: props.safeAccountConfig,
            saltNonce,
            options,
            callback: (txHash) => {
              onSubmitCallback(undefined, txHash)
            },
          },
          data.safeVersion,
          true,
        )
      }
    } catch (_err) {
      const error = asError(_err)
      const submitError = isWalletRejection(error)
        ? 'User rejected signing.'
        : 'Error creating the Safe Account. Please try again later.'
      setSubmitError(submitError)

      if (isWalletRejection(error)) {
        trackEvent(CREATE_SAFE_EVENTS.REJECT_CREATE_SAFE)
      }
    }

    setIsCreating(false)
  }

  const showNetworkWarning =
    (isWrongChain && payMethod === PayMethod.PayNow && !willRelay && !isMultiChainDeployment) ||
    (isWrongChain && !isCounterfactualEnabled && !isMultiChainDeployment)

  const isDisabled = showNetworkWarning || isCreating

  return (
    <>
      <Box className={layoutCss.row}>
        <SafeSetupOverview name={data.name} owners={data.owners} threshold={data.threshold} networks={data.networks} />
      </Box>

      {isCounterfactualEnabled && (
        <>
          <Divider />
          <Box className={layoutCss.row}>
            <PayNowPayLater
              totalFee={totalFee}
              isMultiChain={isMultiChainDeployment}
              canRelay={canRelay}
              payMethod={payMethod}
              setPayMethod={setPayMethod}
            />

            {canRelay && payMethod === PayMethod.PayNow && (
              <>
                <Grid container spacing={3} pt={2}>
                  <ReviewRow
                    value={
                      <ExecutionMethodSelector
                        executionMethod={executionMethod}
                        setExecutionMethod={setExecutionMethod}
                        relays={minRelays}
                      />
                    }
                  />
                </Grid>
              </>
            )}

            {showNetworkWarning && <NetworkWarning />}

            {payMethod === PayMethod.PayNow && (
              <Grid item>
                <Typography component="div" mt={2}>
                  You will have to confirm a transaction and pay an estimated fee of{' '}
                  <NetworkFee totalFee={totalFee} willRelay={willRelay} chain={chain} inline /> with your connected
                  wallet
                </Typography>
              </Grid>
            )}
          </Box>
        </>
      )}

      {!isCounterfactualEnabled && (
        <>
          <Divider />
          <Box className={layoutCss.row} display="flex" flexDirection="column" gap={3}>
            {canRelay && (
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

                    {!willRelay && (
                      <Typography variant="body2" color="text.secondary" mt={1}>
                        You will have to confirm a transaction with your connected wallet.
                      </Typography>
                    )}
                  </>
                }
              />
            </Grid>

            {showNetworkWarning && <NetworkWarning />}

            {!walletCanPay && !willRelay && (
              <ErrorMessage>
                Your connected wallet doesn&apos;t have enough funds to execute this transaction
              </ErrorMessage>
            )}
          </Box>
        </>
      )}

      <Divider />

      <Box className={layoutCss.row}>
        {submitError && <ErrorMessage className={css.errorMessage}>{submitError}</ErrorMessage>}
        <Box display="flex" flexDirection="row" justifyContent="space-between" gap={3}>
          <Button
            data-testid="back-btn"
            variant="outlined"
            size="small"
            onClick={handleBack}
            startIcon={<ArrowBackIcon fontSize="small" />}
          >
            Back
          </Button>
          <Button
            data-testid="review-step-next-btn"
            onClick={handleCreateSafeClick}
            variant="contained"
            size="stretched"
            disabled={isDisabled}
          >
            {isCreating ? <CircularProgress size={18} /> : 'Create'}
          </Button>
        </Box>
      </Box>
    </>
  )
}

export default ReviewStep
