import ChainIndicator from '@/components/common/ChainIndicator'
import type { NamedAddress } from '@/components/new-safe/create/types'
import EthHashInfo from '@/components/common/EthHashInfo'
import { getTotalFeeFormatted } from '@/hooks/useGasPrice'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { NewSafeFormData } from '@/components/new-safe/create'
import { computeNewSafeAddress } from '@/components/new-safe/create/logic'
import { getAvailableSaltNonce } from '@/components/new-safe/create/logic/utils'
import NetworkWarning from '@/components/new-safe/create/NetworkWarning'
import css from '@/components/new-safe/create/steps/ReviewStep/styles.module.css'
import layoutCss from '@/components/new-safe/create/styles.module.css'
import { useEstimateSafeCreationGas } from '@/components/new-safe/create/useEstimateSafeCreationGas'
import useSyncSafeCreationStep from '@/components/new-safe/create/useSyncSafeCreationStep'
import ReviewRow from '@/components/new-safe/ReviewRow'
import ErrorMessage from '@/components/tx/ErrorMessage'
import { ExecutionMethod, ExecutionMethodSelector } from '@/components/tx/ExecutionMethodSelector'
import { RELAY_SPONSORS } from '@/components/tx/SponsoredBy'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import PayNowPayLater, { PayMethod } from '@/features/counterfactual/PayNowPayLater'
import { createCounterfactualSafe } from '@/features/counterfactual/utils'
import { useCurrentChain, useHasFeature } from '@/hooks/useChains'
import useGasPrice from '@/hooks/useGasPrice'
import useIsWrongChain from '@/hooks/useIsWrongChain'
import { MAX_HOUR_RELAYS, useLeastRemainingRelays } from '@/hooks/useRemainingRelays'
import useWalletCanPay from '@/hooks/useWalletCanPay'
import useWallet from '@/hooks/wallets/useWallet'
import { useWeb3 } from '@/hooks/wallets/web3'
import { CREATE_SAFE_CATEGORY, CREATE_SAFE_EVENTS, OVERVIEW_EVENTS, trackEvent } from '@/services/analytics'
import { gtmSetSafeAddress } from '@/services/analytics/gtm'
import { getReadOnlyFallbackHandlerContract } from '@/services/contracts/safeContracts'
import { isSocialLoginWallet } from '@/services/mpc/SocialLoginModule'
import { useAppDispatch } from '@/store'
import { FEATURES } from '@/utils/chains'
import { hasRemainingRelays } from '@/utils/relaying'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Alert, Box, Button, CircularProgress, Divider, Grid, Typography } from '@mui/material'
import { type DeploySafeProps } from '@safe-global/protocol-kit'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import classnames from 'classnames'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useMemo, useState } from 'react'
import { usePendingSafe } from '../StatusStep/usePendingSafe'

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
  const wallet = useWallet()

  const isSocialLogin = isSocialLoginWallet(wallet?.label)

  if (!isSocialLogin) {
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

  if (willRelay) {
    const sponsor = RELAY_SPONSORS[chain?.chainId || ''] || RELAY_SPONSORS.default
    return (
      <>
        <Typography fontWeight="bold">Free</Typography>
        <Typography variant="body2">
          Your account is sponsored by
          <Image
            data-testid="sponsor-icon"
            src={sponsor.logo}
            alt={sponsor.name}
            width={16}
            height={16}
            style={{ margin: '-3px 0px -3px 4px' }}
          />{' '}
          {sponsor.name}
        </Typography>
      </>
    )
  }

  return (
    <Alert severity="error">
      You have used up your {MAX_HOUR_RELAYS} free transactions per hour. Please try again later.
    </Alert>
  )
}

export const SafeSetupOverview = ({
  name,
  owners,
  threshold,
}: {
  name?: string
  owners: NamedAddress[]
  threshold: number
}) => {
  const chain = useCurrentChain()

  return (
    <Grid container spacing={3}>
      <ReviewRow name="Network" value={<ChainIndicator chainId={chain?.chainId} inline />} />
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
  useSyncSafeCreationStep(setStep)
  const chain = useCurrentChain()
  const wallet = useWallet()
  const provider = useWeb3()
  const dispatch = useAppDispatch()
  const router = useRouter()
  const [gasPrice] = useGasPrice()
  const [_, setPendingSafe] = usePendingSafe()
  const [payMethod, setPayMethod] = useState(PayMethod.PayLater)
  const [executionMethod, setExecutionMethod] = useState(ExecutionMethod.RELAY)
  const [isCreating, setIsCreating] = useState<boolean>(false)
  const [submitError, setSubmitError] = useState<string>()
  const isCounterfactualEnabled = useHasFeature(FEATURES.COUNTERFACTUAL)

  const ownerAddresses = useMemo(() => data.owners.map((owner) => owner.address), [data.owners])
  const [minRelays] = useLeastRemainingRelays(ownerAddresses)

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

  const { gasLimit } = useEstimateSafeCreationGas(safeParams)

  const maxFeePerGas = gasPrice?.maxFeePerGas
  const maxPriorityFeePerGas = gasPrice?.maxPriorityFeePerGas

  const walletCanPay = useWalletCanPay({ gasLimit, maxFeePerGas, maxPriorityFeePerGas })

  const totalFee = getTotalFeeFormatted(maxFeePerGas, gasLimit, chain)

  // Only 1 out of 1 safe setups are supported for now
  const isCounterfactual = data.threshold === 1 && data.owners.length === 1 && isCounterfactualEnabled

  const handleBack = () => {
    onBack(data)
  }

  const createSafe = async () => {
    if (!wallet || !provider || !chain) return

    setIsCreating(true)

    try {
      const readOnlyFallbackHandlerContract = await getReadOnlyFallbackHandlerContract(
        chain.chainId,
        LATEST_SAFE_VERSION,
      )

      const props: DeploySafeProps = {
        safeAccountConfig: {
          threshold: data.threshold,
          owners: data.owners.map((owner) => owner.address),
          fallbackHandler: await readOnlyFallbackHandlerContract.getAddress(),
        },
      }

      const saltNonce = await getAvailableSaltNonce(provider, { ...props, saltNonce: '0' })
      const safeAddress = await computeNewSafeAddress(provider, { ...props, saltNonce })

      if (isCounterfactual && payMethod === PayMethod.PayLater) {
        gtmSetSafeAddress(safeAddress)

        trackEvent({ ...OVERVIEW_EVENTS.PROCEED_WITH_TX, label: 'counterfactual', category: CREATE_SAFE_CATEGORY })
        await createCounterfactualSafe(chain, safeAddress, saltNonce, data, dispatch, props, router)
        trackEvent({ ...CREATE_SAFE_EVENTS.CREATED_SAFE, label: 'counterfactual' })
        return
      }

      const pendingSafe = {
        ...data,
        saltNonce: Number(saltNonce),
        safeAddress,
        willRelay,
      }

      trackEvent({ ...OVERVIEW_EVENTS.PROCEED_WITH_TX, label: 'deployment', category: CREATE_SAFE_CATEGORY })

      setPendingSafe(pendingSafe)
      onSubmit(pendingSafe)
    } catch (_err) {
      setSubmitError('Error creating the Safe Account. Please try again later.')
    }

    setIsCreating(false)
  }

  const isSocialLogin = isSocialLoginWallet(wallet?.label)
  const isDisabled = isWrongChain || (isSocialLogin && !willRelay) || isCreating

  return (
    <>
      <Box className={layoutCss.row}>
        <SafeSetupOverview name={data.name} owners={data.owners} threshold={data.threshold} />
      </Box>

      {isCounterfactual && (
        <>
          <Divider />
          <Box className={layoutCss.row}>
            <PayNowPayLater totalFee={totalFee} canRelay={canRelay} payMethod={payMethod} setPayMethod={setPayMethod} />

            {canRelay && !isSocialLogin && payMethod === PayMethod.PayNow && (
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
            )}

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

      {!isCounterfactual && (
        <>
          <Divider />
          <Box className={layoutCss.row} display="flex" flexDirection="column" gap={3}>
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

            {isWrongChain && <NetworkWarning />}

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
            onClick={createSafe}
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
