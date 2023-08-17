import { Box, Step, StepConnector, Stepper, Typography } from '@mui/material'
import { useEffect } from 'react'
import css from '@/components/new-safe/create/steps/StatusStep/styles.module.css'
import EthHashInfo from '@/components/common/EthHashInfo'
import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import StatusStep from '@/components/new-safe/create/steps/StatusStep/StatusStep'
import { usePendingSafe } from './usePendingSafe'
import { useHasFeature } from '@/hooks/useChains'
import { useWeb3ReadOnly } from '@/hooks/wallets/web3'
import { FEATURES } from '@/utils/chains'
import { Proxy_factory__factory } from '@/types/contracts/factories/@safe-global/safe-deployments/dist/assets/v1.3.0'

const proxyFactoryInterface = Proxy_factory__factory.createInterface()

// TODO: Remove when we update SDK
export const useSyncZkEvmSafeAddress = (status: SafeCreationStatus) => {
  const shouldFetchAddress = useHasFeature(FEATURES.SAFE_CREATION_FETCH_ADDRESS)
  const [pendingSafe, setPendingSafe] = usePendingSafe()
  const web3ReadOnly = useWeb3ReadOnly()

  useEffect(() => {
    if (
      !shouldFetchAddress ||
      status !== SafeCreationStatus.SUCCESS ||
      !pendingSafe ||
      !pendingSafe.txHash ||
      pendingSafe.safeAddress ||
      !web3ReadOnly
    ) {
      return
    }

    let isCurrent = true

    web3ReadOnly
      .getTransactionReceipt('0x3cd978744f5515be16affda1a66a94216e66d3d2511936b48da7e877eee75730')
      .then((receipt) => {
        if (!isCurrent) {
          return
        }

        const [proxyCreationLog] = receipt.logs
          .map((log) => {
            try {
              return proxyFactoryInterface.parseLog(log)
            } catch {
              return null
            }
          })
          .filter((log) => log !== null)

        const safeAddress = proxyCreationLog?.args.proxy
        setPendingSafe(pendingSafe ? { ...pendingSafe, safeAddress } : undefined)
      })
      .catch(() => null)

    return () => {
      isCurrent = false
    }
  }, [
    status,
    web3ReadOnly,
    pendingSafe,
    pendingSafe?.txHash,
    pendingSafe?.safeAddress,
    shouldFetchAddress,
    setPendingSafe,
  ])
}

const StatusStepper = ({ status }: { status: SafeCreationStatus }) => {
  const [pendingSafe] = usePendingSafe()

  useSyncZkEvmSafeAddress(status)

  return (
    <Stepper orientation="vertical" nonLinear connector={<StepConnector className={css.connector} />}>
      {pendingSafe?.safeAddress && (
        <Step>
          <StatusStep isLoading={!pendingSafe.safeAddress} safeAddress={pendingSafe.safeAddress}>
            <Box>
              <Typography variant="body2" fontWeight="700">
                Your Safe Account address
              </Typography>
              <EthHashInfo
                address={pendingSafe.safeAddress}
                hasExplorer
                showCopyButton
                showName={false}
                shortAddress={false}
                showAvatar={false}
              />
            </Box>
          </StatusStep>
        </Step>
      )}
      <Step>
        <StatusStep isLoading={!(pendingSafe?.txHash || pendingSafe?.taskId)} safeAddress={pendingSafe?.safeAddress}>
          <Box>
            <Typography variant="body2" fontWeight="700">
              Validating transaction
            </Typography>
            {pendingSafe?.txHash && (
              <EthHashInfo
                address={pendingSafe.txHash}
                hasExplorer
                showCopyButton
                showName={false}
                shortAddress={true}
                showAvatar={false}
              />
            )}
          </Box>
        </StatusStep>
      </Step>
      <Step>
        <StatusStep isLoading={status < SafeCreationStatus.SUCCESS} safeAddress={pendingSafe?.safeAddress}>
          <Typography variant="body2" fontWeight="700">
            Indexing
          </Typography>
        </StatusStep>
      </Step>
      <Step>
        <StatusStep isLoading={status !== SafeCreationStatus.INDEXED} safeAddress={pendingSafe?.safeAddress}>
          <Typography variant="body2" fontWeight="700">
            Safe Account is ready
          </Typography>
        </StatusStep>
      </Step>
    </Stepper>
  )
}

export default StatusStepper
