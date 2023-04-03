import { useMemo } from 'react'
import { type TransactionOptions, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import useOnboard from '@/hooks/wallets/useOnboard'
import { isSmartContractWallet } from '@/hooks/wallets/wallets'
import {
  dispatchOnChainSigning,
  dispatchTxExecution,
  dispatchTxProposal,
  dispatchTxSigning,
} from '@/services/tx/tx-sender'
import { useHasPendingTxs } from '@/hooks/usePendingTxs'
import { sameString } from '@safe-global/safe-core-sdk/dist/src/utils'

type TxActions = {
  signTx: (safeTx?: SafeTransaction, txId?: string) => Promise<string>
  executeTx: (txOptions: TransactionOptions, safeTx?: SafeTransaction, txId?: string) => Promise<string>
}

enum DependencyError {
  NO_TX = 'Transaction not provided',
  NO_WALLET = 'Wallet not connected',
  NO_ONBOARD = 'Onboard not connected',
}

export const useTxActions = (): TxActions => {
  const { safe, safeAddress } = useSafeInfo()
  const { chainId, version } = safe
  const onboard = useOnboard()
  const wallet = useWallet()

  return useMemo<TxActions>(() => {
    const proposeTx = async (sender: string, safeTx: SafeTransaction, txId?: string, origin?: string) => {
      const tx = await dispatchTxProposal({
        chainId,
        safeAddress,
        sender,
        safeTx,
        txId,
        origin,
      })
      return tx.txId
    }

    const signTx: TxActions['signTx'] = async (safeTx, txId) => {
      if (!safeTx) throw Error(DependencyError.NO_TX)
      if (!onboard) throw Error(DependencyError.NO_ONBOARD)
      if (!wallet) throw Error(DependencyError.NO_WALLET)

      // Smart contract wallets must sign via an on-chain tx
      if (await isSmartContractWallet(wallet)) {
        // If the first signature is a smart contract wallet, we have to propose w/o signatures
        // Otherwise the backend won't pick up the tx
        // The signature will be added once the on-chain signature is indexed
        const id = txId || (await proposeTx(wallet.address, safeTx, txId, origin))
        await dispatchOnChainSigning(safeTx, id, onboard, chainId)
        return id
      }

      // Otherwise, sign off-chain
      const signedTx = await dispatchTxSigning(safeTx, version, onboard, chainId, txId)
      return await proposeTx(wallet.address, signedTx, txId, origin)
    }

    const executeTx: TxActions['executeTx'] = async (txOptions, safeTx, txId) => {
      if (!safeTx) throw Error(DependencyError.NO_TX)
      if (!onboard) throw Error(DependencyError.NO_ONBOARD)
      if (!wallet) throw Error(DependencyError.NO_WALLET)

      const id = txId || (await proposeTx(wallet.address, safeTx, txId, origin))
      await dispatchTxExecution(safeTx, txOptions, id, onboard, chainId)
      return id
    }

    return { signTx, executeTx }
  }, [chainId, safeAddress, version, onboard, wallet])
}

export const useValidateNonce = (safeTx?: SafeTransaction): boolean => {
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
