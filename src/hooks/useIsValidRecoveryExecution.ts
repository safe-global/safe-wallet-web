import { getModuleInstance, KnownContracts } from '@gnosis.pm/zodiac'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'

import useWallet from './wallets/useWallet'
import { useWeb3ReadOnly } from './wallets/web3'
import useAsync from './useAsync'
import useSafeInfo from './useSafeInfo'
import { getPatchedSignerProvider } from './useIsValidExecution'
import { useRecoveryTxState } from './useRecoveryTxState'
import { useIsRecoverer } from './useIsRecoverer'
import { getCurrentGnosisSafeContract, getReadOnlyMultiSendCallOnlyContract } from '@/services/contracts/safeContracts'
import { createTx } from '@/services/tx/tx-sender'
import { isMultiSendCalldata } from '@/utils/transaction-calldata'
import { encodeSignatures } from '@/services/tx/encodeSignatures'
import type { AsyncResult } from './useAsync'
import type { RecoveryQueueItem } from '@/services/recovery/recovery-state'

// Hook to check the validity of a recovery proposal before it is executed on-chain
// e.g. proposed Account setup from Recoverer before it is submitted to Delay Modifier
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

    return (async () => {
      const provider = getPatchedSignerProvider(wallet, safe.chainId, web3ReadOnly)
      const delayModifier = getModuleInstance(KnownContracts.DELAY, delayModifierAddress, provider)

      const signer = provider.getSigner()
      const contract = delayModifier.connect(signer)

      try {
        return await contract.callStatic.execTransactionFromModule(
          safeTx.data.to,
          safeTx.data.value,
          safeTx.data.data,
          safeTx.data.operation,
        )
      } catch (error) {
        throw error
      }
    })()
  }, [isRecoverer, safeTx, wallet, web3ReadOnly, safe.chainId, delayModifierAddress])
}

// Hook to check the validity of an existing recovery proposal before it is executed
// e.g. a Account setup that was previously submitted to Delay Modifier
export function useIsValidRecoveryExecuteNextTx(recovery: RecoveryQueueItem): AsyncResult<boolean> {
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const web3ReadOnly = useWeb3ReadOnly()
  const { isExecutable } = useRecoveryTxState(recovery)

  return useAsync(() => {
    if (!isExecutable || !wallet?.address || !web3ReadOnly) {
      return
    }

    return (async () => {
      const provider = getPatchedSignerProvider(wallet, safe.chainId, web3ReadOnly)
      const delayModifier = getModuleInstance(KnownContracts.DELAY, recovery.address, provider)

      const signer = provider.getSigner()
      const contract = delayModifier.connect(signer)

      try {
        const { to, value, data, operation } = recovery.args

        await contract.callStatic.executeNextTx(to, value, data, operation)

        return true
      } catch (error) {
        throw error
      }
    })()
  }, [isExecutable, recovery.address, recovery.args, safe.chainId, wallet, web3ReadOnly])
}

// Hook to check the validity of skipping expired recovery proposals before it is executed
// e.g. Account proposals that were previously submitted to Delay Modifier but have since expired
export function useIsValidRecoverySkipExpired(recovery: RecoveryQueueItem): AsyncResult<boolean> {
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const web3ReadOnly = useWeb3ReadOnly()
  const { isExpired } = useRecoveryTxState(recovery)

  return useAsync(() => {
    if (!isExpired || !wallet?.address || !web3ReadOnly) {
      return
    }

    return (async () => {
      const provider = getPatchedSignerProvider(wallet, safe.chainId, web3ReadOnly)
      const delayModifier = getModuleInstance(KnownContracts.DELAY, recovery.address, provider)

      const signer = provider.getSigner()
      const contract = delayModifier.connect(signer)

      try {
        await contract.callStatic.skipExpired()

        return true
      } catch (error) {
        throw error
      }
    })()
  }, [isExpired, recovery.address, safe.chainId, wallet, web3ReadOnly])
}

// Hook to check the validity of what happens to a Safe after a recovery proposal is executed
// e.g. Account setup that was previously submitted to Delay Modifier and will be executed
export function useIsValidRecoveryExecution(recovery: RecoveryQueueItem): AsyncResult<boolean> {
  const wallet = useWallet()
  const { safe } = useSafeInfo()
  const web3ReadOnly = useWeb3ReadOnly()
  const { isExecutable } = useRecoveryTxState(recovery)

  return useAsync(() => {
    if (!isExecutable || !wallet?.address || !web3ReadOnly) {
      return
    }

    return (async () => {
      const provider = getPatchedSignerProvider(wallet, safe.chainId, web3ReadOnly)

      if (isMultiSendCalldata(recovery.args.data)) {
        const multiSendContract = getReadOnlyMultiSendCallOnlyContract(safe.chainId, safe.version)

        try {
          await multiSendContract.contract.connect(provider).callStatic.multiSend(recovery.args.data)

          return true
        } catch (error) {
          throw error
        }
      }

      // TODO: Refactor below to use `useIsValidExecution` hook
      const safeContract = getCurrentGnosisSafeContract(safe, provider)

      try {
        const safeTx = await createTx({
          to: recovery.args.to,
          data: recovery.args.data,
          operation: recovery.args.operation,
          value: recovery.args.value.toString(),
        })

        await safeContract.contract.callStatic.execTransaction(
          safeTx.data.to,
          safeTx.data.value,
          safeTx.data.data,
          safeTx.data.operation,
          safeTx.data.safeTxGas,
          safeTx.data.baseGas,
          safeTx.data.gasPrice,
          safeTx.data.gasToken,
          safeTx.data.refundReceiver,
          encodeSignatures(safeTx),
        )

        return true
      } catch (error) {
        throw error
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isExecutable,
    recovery.args.data,
    recovery.args.operation,
    recovery.args.to,
    recovery.args.value,
    wallet,
    web3ReadOnly,
    // Ensure owner changes are reflected in the validity check
    safe.txHistoryTag,
    // TODO: Refactor `getCurrentGnosisSafeContract` to use the following as otherwise causes unnecessary re-renders
    safe.address.value,
    safe.chainId,
    safe.version,
  ])
}
