import { useMemo } from 'react'
import { type TransactionOptions, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
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
import { sameString } from '@safe-global/safe-core-sdk/dist/src/utils'
import type { ConnectedWallet } from '@/services/onboard'
import type { OnboardAPI } from '@web3-onboard/core'
import { hasEnoughSignatures } from '@/utils/transactions'

type TxActions = {
  signTx: (safeTx?: SafeTransaction, txId?: string, origin?: string) => Promise<string>
  executeTx: (
    txOptions: TransactionOptions,
    safeTx?: SafeTransaction,
    txId?: string,
    origin?: string,
    isRelayed?: boolean,
  ) => Promise<string>
}

function assertTx(safeTx?: SafeTransaction): asserts safeTx {
  if (!safeTx) throw new Error('Transaction not provided')
}
function assertWallet(wallet: ConnectedWallet | null): asserts wallet {
  if (!wallet) throw new Error('Wallet not connected')
}
function assertOnboard(onboard?: OnboardAPI): asserts onboard {
  if (!onboard) throw new Error('Onboard not connected')
}

export const useTxActions = (): TxActions => {
  const { safe } = useSafeInfo()
  const onboard = useOnboard()
  const wallet = useWallet()

  return useMemo<TxActions>(() => {
    const safeAddress = safe.address.value
    const { chainId, version } = safe

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

    const signRelayedTx = async (safeTx: SafeTransaction, txId?: string): Promise<SafeTransaction> => {
      assertTx(safeTx)
      assertWallet(wallet)
      assertOnboard(onboard)

      // Smart contracts cannot sign transactions off-chain
      if (await isSmartContractWallet(wallet)) {
        throw new Error('Cannot relay an unsigned transaction from a smart contract wallet')
      }
      return await dispatchTxSigning(safeTx, version, onboard, chainId, txId)
    }

    const signTx: TxActions['signTx'] = async (safeTx, txId, origin) => {
      assertTx(safeTx)
      assertWallet(wallet)
      assertOnboard(onboard)

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

    const executeTx: TxActions['executeTx'] = async (txOptions, safeTx, txId, origin, isRelayed) => {
      assertTx(safeTx)
      assertWallet(wallet)
      assertOnboard(onboard)

      // Relayed transactions must be fully signed, so request a final signature if needed
      if (isRelayed && !hasEnoughSignatures(safeTx, safe)) {
        safeTx = await signRelayedTx(safeTx)
        txId = await proposeTx(wallet.address, safeTx, txId, origin)
      }

      // Propose the tx if there's no id yet ("immediate execution")
      if (!txId) {
        txId = await proposeTx(wallet.address, safeTx, txId, origin)
      }

      // Relay or execute the tx via connected wallet
      if (isRelayed) {
        await dispatchTxRelay(safeTx, safe, txId, txOptions.gasLimit)
      } else {
        await dispatchTxExecution(safeTx, txOptions, txId, onboard, chainId, safeAddress)
      }

      return txId
    }

    return { signTx, executeTx }
  }, [safe, onboard, wallet])
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
