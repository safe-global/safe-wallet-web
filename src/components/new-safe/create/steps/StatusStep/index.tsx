import { useCounter } from '@/components/common/Notifications/useCounter'
import type { StepRenderProps } from '@/components/new-safe/CardStepper/useCardStepper'
import type { NewSafeFormData } from '@/components/new-safe/create'
import { getRedirect } from '@/components/new-safe/create/logic'
import { updateAddressBook } from '@/components/new-safe/create/logic/address-book'
import StatusMessage from '@/components/new-safe/create/steps/StatusStep/StatusMessage'
import useUndeployedSafe from '@/components/new-safe/create/steps/StatusStep/useUndeployedSafe'
import lightPalette from '@/components/theme/lightPalette'
import { AppRoutes } from '@/config/routes'
import { safeCreationPendingStatuses } from '@/features/counterfactual/hooks/usePendingSafeStatuses'
import { SafeCreationEvent, safeCreationSubscribe } from '@/features/counterfactual/services/safeCreationEvents'
import { useCurrentChain } from '@/hooks/useChains'
import Rocket from '@/public/images/common/rocket.svg'
import { CREATE_SAFE_EVENTS, trackEvent } from '@/services/analytics'
import { useAppDispatch } from '@/store'
import { Alert, AlertTitle, Box, Button, Paper, Stack, SvgIcon, Typography } from '@mui/material'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import useSyncSafeCreationStep from '../../useSyncSafeCreationStep'
import { getTxOptions } from '@/utils/transactions'
import useGasPrice from '@/hooks/useGasPrice'
import useGasLimit from '@/hooks/useGasLimit'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { dispatchSafeCreationTxSpeedUp } from '@/services/tx/tx-sender'
import type { TransactionOptions } from '@safe-global/safe-core-sdk-types'
import useWallet from '@/hooks/wallets/useWallet'

const SPEED_UP_THRESHOLD_IN_SECONDS = 15

export const CreateSafeStatus = ({
  data,
  setProgressColor,
  setStep,
  setStepData,
}: StepRenderProps<NewSafeFormData>) => {
  const [status, setStatus] = useState<SafeCreationEvent>(SafeCreationEvent.PROCESSING)
  const [safeAddress, pendingSafe] = useUndeployedSafe()
  const router = useRouter()
  const chain = useCurrentChain()
  const dispatch = useAppDispatch()

  //
  const [speedUpFee] = useGasPrice(true)
  const { gasLimit } = useGasLimit()
  const provider = useWeb3ReadOnly()
  const wallet = useWallet()
  // const pendingTx = useAppSelector((state) => selectPendingTxById(state, tx.id))

  const counter = useCounter(pendingSafe?.status.submittedAt)

  const isError = status === SafeCreationEvent.FAILED || status === SafeCreationEvent.REVERTED

  useSyncSafeCreationStep(setStep)

  useEffect(() => {
    const unsubFns = Object.entries(safeCreationPendingStatuses).map(([event]) =>
      safeCreationSubscribe(event as SafeCreationEvent, async () => {
        setStatus(event as SafeCreationEvent)
      }),
    )

    return () => {
      unsubFns.forEach((unsub) => unsub())
    }
  }, [])

  useEffect(() => {
    if (!chain || !safeAddress) return

    if (status === SafeCreationEvent.SUCCESS) {
      dispatch(updateAddressBook(chain.chainId, safeAddress, data.name, data.owners, data.threshold))
      router.push(getRedirect(chain.shortName, safeAddress, router.query?.safeViewRedirectURL))
    }
  }, [dispatch, chain, data.name, data.owners, data.threshold, router, safeAddress, status])

  useEffect(() => {
    if (!setProgressColor) return

    if (isError) {
      setProgressColor(lightPalette.error.main)
    } else {
      setProgressColor(lightPalette.secondary.main)
    }
  }, [isError, setProgressColor])

  const tryAgain = () => {
    trackEvent(CREATE_SAFE_EVENTS.RETRY_CREATE_SAFE)

    if (!pendingSafe) {
      setStep(0)
      return
    }

    setProgressColor?.(lightPalette.secondary.main)
    setStep(2)
    setStepData?.({
      owners: pendingSafe.props.safeAccountConfig.owners.map((owner) => ({ name: '', address: owner })),
      name: '',
      threshold: pendingSafe.props.safeAccountConfig.threshold,
      saltNonce: Number(pendingSafe.props.safeDeploymentConfig?.saltNonce),
      safeAddress,
    })
  }

  const onCancel = () => {
    trackEvent(CREATE_SAFE_EVENTS.CANCEL_CREATE_SAFE)
  }

  const onSpeedUp = async () => {
    const txHash = pendingSafe?.status.txHash
    if (!provider || !txHash || !wallet || !safeAddress) return

    const txId = `creation_${safeAddress}`

    const txOptions = getTxOptions(
      {
        ...speedUpFee,
        gasLimit,
      },
      chain,
    )
    // txOptions.nonce = Number(pendingSafe.props.safeDeploymentConfig?.saltNonce)
    // txOptions.nonce = 171

    try {
      const pendingTx = await provider.getTransaction(txHash)

      if (!pendingTx) throw new Error('Transaction not found')
      txOptions.nonce = pendingTx.nonce

      await dispatchSafeCreationTxSpeedUp(
        txOptions as Omit<TransactionOptions, 'nonce'> & { nonce: number },
        pendingTx.to!,
        pendingTx.data,
        wallet.provider,
        wallet.address,
        safeAddress,
        txId,
      )
    } catch (error) {
      console.log(error)
    }
    // await dispatchSafeCreationTxSpeedUp(txOptions)

    // setOpenSpeedUpModal(true)
    // trackEvent(MODALS_EVENTS.OPEN_SPEED_UP_MODAL)
  }

  return (
    <Paper
      sx={{
        textAlign: 'center',
      }}
    >
      <Box p={{ xs: 2, sm: 8 }}>
        <StatusMessage status={status} isError={isError} pendingSafe={pendingSafe} />

        {counter && counter > SPEED_UP_THRESHOLD_IN_SECONDS && !isError && (
          <Alert severity="warning" icon={<SvgIcon component={Rocket} />} sx={{ mt: 5 }}>
            <AlertTitle>
              <Typography variant="body2" textAlign="left" fontWeight="bold">
                Transaction is taking too long
              </Typography>
            </AlertTitle>
            <Typography variant="body2" textAlign="left">
              Try to speed it up with better gas parameters in your wallet.
            </Typography>
            <Button variant="outlined" size="small" sx={{ py: 0.6 }} onClick={onSpeedUp}>
              Speed up
            </Button>{' '}
          </Alert>
        )}

        {/* <SpeedUpMonitor></SpeedUpMonitor> */}

        {isError && (
          <Stack direction="row" justifyContent="center" gap={2}>
            <Link href={AppRoutes.welcome.index} passHref>
              <Button variant="outlined" onClick={onCancel}>
                Go to homepage
              </Button>
            </Link>
            <Button variant="contained" onClick={tryAgain}>
              Try again
            </Button>
          </Stack>
        )}
      </Box>
    </Paper>
  )
}
