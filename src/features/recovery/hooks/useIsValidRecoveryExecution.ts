import { getModuleInstance, KnownContracts } from '@gnosis.pm/zodiac'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import useWallet from '../../../hooks/wallets/useWallet'
import { useWeb3ReadOnly } from '../../../hooks/wallets/web3'
import useAsync from '../../../hooks/useAsync'
import useSafeInfo from '../../../hooks/useSafeInfo'
import { getPatchedSignerProvider } from '../../../hooks/useIsValidExecution'
import { useRecoveryTxState } from './useRecoveryTxState'
import { useIsRecoverer } from './useIsRecoverer'
import type { AsyncResult } from '../../../hooks/useAsync'
import type { RecoveryQueueItem } from '@/features/recovery/services/recovery-state'

export function useIsValidRecoveryExecTransactionFromModule(
  delayModifierAddress?: string,
  safeTx?: SafeTransaction,
): AsyncResult<boolean> {
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const web3ReadOnly = useWeb3ReadOnly()
  const isRecoverer = useIsRecoverer()

  return useAsync(() => {
    if (!isRecoverer || !safeTx || !wallet || !web3ReadOnly || !delayModifierAddress) {
      return
    }

    const provider = getPatchedSignerProvider(wallet, safe.chainId, web3ReadOnly)
    const delayModifier = getModuleInstance(KnownContracts.DELAY, delayModifierAddress, provider)

    const signer = provider.getSigner()
    const contract = delayModifier.connect(signer)

    return contract.callStatic.execTransactionFromModule(
      safeTx.data.to,
      safeTx.data.value,
      safeTx.data.data,
      safeTx.data.operation,
    )
  }, [isRecoverer, safeTx, wallet, web3ReadOnly, safe.chainId, delayModifierAddress])
}

export function useIsValidRecoveryExecuteNextTx(recovery: RecoveryQueueItem): AsyncResult<boolean> {
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const web3ReadOnly = useWeb3ReadOnly()
  const { isExecutable } = useRecoveryTxState(recovery)

  return useAsync(async () => {
    if (!isExecutable || !wallet?.address || !web3ReadOnly) {
      return
    }

    const provider = getPatchedSignerProvider(wallet, safe.chainId, web3ReadOnly)
    const delayModifier = getModuleInstance(KnownContracts.DELAY, recovery.address, provider)

    const signer = provider.getSigner()
    const contract = delayModifier.connect(signer)

    const { to, value, data, operation } = recovery.args

    await contract.callStatic.executeNextTx(to, value, data, operation)

    return true
  }, [isExecutable, recovery.address, recovery.args, safe.chainId, wallet, web3ReadOnly])
}

export function useIsValidRecoverySkipExpired(recovery: RecoveryQueueItem): AsyncResult<boolean> {
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const web3ReadOnly = useWeb3ReadOnly()
  const { isExpired } = useRecoveryTxState(recovery)

  return useAsync(async () => {
    if (!isExpired || !wallet?.address || !web3ReadOnly) {
      return
    }

    const provider = getPatchedSignerProvider(wallet, safe.chainId, web3ReadOnly)
    const delayModifier = getModuleInstance(KnownContracts.DELAY, recovery.address, provider)

    const signer = provider.getSigner()
    const contract = delayModifier.connect(signer)

    await contract.callStatic.skipExpired()

    return true
  }, [isExpired, recovery.address, safe.chainId, wallet, web3ReadOnly])
}
