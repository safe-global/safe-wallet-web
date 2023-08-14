import { useMemo } from 'react'
import { type TransactionOptions, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { sameString } from '@safe-global/safe-core-sdk/dist/src/utils'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import useOnboard from '@/hooks/wallets/useOnboard'
import { isSmartContractWallet } from '@/utils/wallets'
import {
  dispatchOnChainSigning,
  dispatchTxExecution,
  dispatchTxProposal,
  dispatchTxRelay,
  dispatchTxSigning,
} from '@/services/tx/tx-sender'
import { useHasPendingTxs } from '@/hooks/usePendingTxs'
import type { ConnectedWallet } from '@/services/onboard'
import type { OnboardAPI } from '@web3-onboard/core'
import { getSafeTxGas, getRecommendedNonce } from '@/services/tx/tx-sender/recommendedNonce'
import useAsync from '@/hooks/useAsync'
import { useUpdateBatch } from '@/hooks/useDraftBatch'

type TxActions = {
  addToBatch: (safeTx?: SafeTransaction, origin?: string, humanDescription?: string) => Promise<string>
  signTx: (safeTx?: SafeTransaction, txId?: string, origin?: string, humanDescription?: string) => Promise<string>
  executeTx: ({
    txOptions,
    safeTx,
    txId,
    origin,
    willRelay,
    humanDescription,
  }: {
    txOptions: TransactionOptions
    safeTx?: SafeTransaction
    txId?: string
    origin?: string
    willRelay?: boolean
    humanDescription?: string
  }) => Promise<string>
}

function assertTx(safeTx: SafeTransaction | undefined): asserts safeTx {
  if (!safeTx) throw new Error('Transaction not provided')
}
function assertWallet(wallet: ConnectedWallet | null): asserts wallet {
  if (!wallet) throw new Error('Wallet not connected')
}
function assertOnboard(onboard: OnboardAPI | undefined): asserts onboard {
  if (!onboard) throw new Error('Onboard not connected')
}

export const useTxActions = (): TxActions => {
  const { safe } = useSafeInfo()
  const onboard = useOnboard()
  const wallet = useWallet()
  const [addTxToBatch] = useUpdateBatch()

  return useMemo<TxActions>(() => {
    const safeAddress = safe.address.value
    const { chainId, version } = safe

    const proposeTx = async (
      sender: string,
      safeTx: SafeTransaction,
      txId?: string,
      origin?: string,
      humanDescription?: string,
    ) => {
      return dispatchTxProposal({
        chainId,
        safeAddress,
        sender,
        safeTx,
        txId,
        origin,
        humanDescription,
      })
    }

    const addToBatch: TxActions['addToBatch'] = async (safeTx, origin, humanDescription) => {
      assertTx(safeTx)
      assertWallet(wallet)

      const tx = await proposeTx(wallet.address, safeTx, undefined, origin, humanDescription)
      await addTxToBatch(tx)
      return tx.txId
    }

    const signRelayedTx = async (
      safeTx: SafeTransaction,
      txId?: string,
      humanDescription?: string,
    ): Promise<SafeTransaction> => {
      assertTx(safeTx)
      assertWallet(wallet)
      assertOnboard(onboard)

      // Smart contracts cannot sign transactions off-chain
      if (await isSmartContractWallet(wallet)) {
        throw new Error('Cannot relay an unsigned transaction from a smart contract wallet')
      }
      return await dispatchTxSigning(safeTx, version, onboard, chainId, txId, humanDescription)
    }

    const signTx: TxActions['signTx'] = async (safeTx, txId, origin, humanDescription) => {
      assertTx(safeTx)
      assertWallet(wallet)
      assertOnboard(onboard)

      // Smart contract wallets must sign via an on-chain tx
      if (await isSmartContractWallet(wallet)) {
        // If the first signature is a smart contract wallet, we have to propose w/o signatures
        // Otherwise the backend won't pick up the tx
        // The signature will be added once the on-chain signature is indexed
        const id = txId || (await proposeTx(wallet.address, safeTx, txId, origin)).txId
        await dispatchOnChainSigning(safeTx, id, onboard, chainId, humanDescription)
        return id
      }

      // Otherwise, sign off-chain
      const signedTx = await dispatchTxSigning(safeTx, version, onboard, chainId, txId, humanDescription)
      const tx = await proposeTx(wallet.address, signedTx, txId, origin, humanDescription)
      return tx.txId
    }

    const executeTx: TxActions['executeTx'] = async ({
      txOptions,
      safeTx,
      txId,
      origin,
      willRelay,
      humanDescription,
    }) => {
      assertTx(safeTx)
      assertWallet(wallet)
      assertOnboard(onboard)

      // Relayed transactions must be fully signed, so request a final signature if needed
      if (willRelay && safeTx.signatures.size < safe.threshold) {
        safeTx = await signRelayedTx(safeTx)
        const tx = await proposeTx(wallet.address, safeTx, txId, origin, humanDescription)
        txId = tx.txId
      }

      // Propose the tx if there's no id yet ("immediate execution")
      if (!txId) {
        const tx = await proposeTx(wallet.address, safeTx, txId, origin, humanDescription)
        txId = tx.txId
      }

      // Relay or execute the tx via connected wallet
      if (willRelay) {
        await dispatchTxRelay(safeTx, safe, txId, txOptions.gasLimit, humanDescription)
      } else {
        await dispatchTxExecution(safeTx, txOptions, txId, onboard, chainId, safeAddress, humanDescription)
      }

      return txId
    }

    return { addToBatch, signTx, executeTx }
  }, [safe, onboard, wallet, addTxToBatch])
}

export const useValidateNonce = (safeTx: SafeTransaction | undefined): boolean => {
  const { safe } = useSafeInfo()
  return !!safeTx && safeTx?.data.nonce === safe.nonce
}

export const useImmediatelyExecutable = (): boolean => {
  const { safe } = useSafeInfo()
  const hasPending = useHasPendingTxs()
  return safe.threshold === 1 && !hasPending
}

// Check if the executor is the safe itself (it won't work)
export const useIsExecutionLoop = (): boolean => {
  const wallet = useWallet()
  const { safeAddress } = useSafeInfo()
  return wallet ? sameString(wallet.address, safeAddress) : false
}

export const useRecommendedNonce = (): number | undefined => {
  const { safeAddress, safe } = useSafeInfo()

  const [recommendedNonce] = useAsync(
    () => {
      if (!safe.chainId || !safeAddress) return

      return getRecommendedNonce(safe.chainId, safeAddress)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [safeAddress, safe.chainId, safe.txQueuedTag], // update when tx queue changes
    false, // keep old recommended nonce while refreshing to avoid skeleton
  )

  return recommendedNonce
}

export const useSafeTxGas = (safeTx: SafeTransaction | undefined): number | undefined => {
  const { safeAddress, safe } = useSafeInfo()

  // Memoize only the necessary params so that the useAsync hook is not called every time safeTx changes
  const safeTxParams = useMemo(() => {
    return !safeTx?.data?.to
      ? undefined
      : {
          to: safeTx?.data.to,
          value: safeTx?.data?.value,
          data: safeTx?.data?.data,
          operation: safeTx?.data?.operation,
        }
  }, [safeTx?.data.to, safeTx?.data.value, safeTx?.data.data, safeTx?.data.operation])

  const [safeTxGas] = useAsync(() => {
    if (!safe.chainId || !safeAddress || !safeTxParams) return

    return getSafeTxGas(safe.chainId, safeAddress, safeTxParams)
  }, [safeAddress, safe.chainId, safeTxParams])

  return safeTxGas
}

export const useAlreadySigned = (safeTx: SafeTransaction | undefined): boolean => {
  const wallet = useWallet()
  const hasSigned =
    safeTx && wallet && (safeTx.signatures.has(wallet.address.toLowerCase()) || safeTx.signatures.has(wallet.address))
  return Boolean(hasSigned)
}
