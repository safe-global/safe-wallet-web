import { getModuleInstance, KnownContracts } from '@gnosis.pm/zodiac'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { ContractTransaction } from 'ethers'
import type { OnboardAPI } from '@web3-onboard/core'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'
import { createWeb3 } from '@/hooks/wallets/web3'

import { didReprice, didRevert } from '@/utils/ethers-utils'
import { recoveryDispatch, RecoveryEvent, RecoveryEventType } from './recoveryEvents'
import { asError } from '@/services/exceptions/utils'
import { assertWalletChain } from '../tx/tx-sender/sdk'

function waitForRecoveryTx({
  tx,
  ...payload
}: {
  moduleAddress: string
  recoveryTxHash: string
  tx: ContractTransaction
  eventType: RecoveryEventType
}) {
  // TODO: This does not make sense to emit here but normal txs and messages emit in the same place
  // We should ideally move this to the beginning of _all_ dispatchers for consistency so that the UI
  // shows a pending state when beginning exectuion of a transaction/message and perhaps rename it to
  // something more generic like DISPATCHING or SUBMITTING

  const event = {
    ...payload,
    txHash: tx.hash,
  }

  recoveryDispatch(RecoveryEvent.EXECUTING, event)

  recoveryDispatch(RecoveryEvent.PROCESSING, event)

  tx.wait()
    .then((receipt) => {
      if (didRevert(receipt)) {
        recoveryDispatch(RecoveryEvent.REVERTED, {
          ...event,
          error: new Error('Transaction reverted by EVM'),
        })
      } else {
        recoveryDispatch(RecoveryEvent.PROCESSED, event)
      }
    })
    .catch((error) => {
      if (didReprice(error)) {
        recoveryDispatch(RecoveryEvent.PROCESSED, event)
      } else {
        recoveryDispatch(RecoveryEvent.FAILED, {
          ...event,
          error: asError(error),
        })
      }
    })
}

export async function dispatchRecoveryProposal({
  onboard,
  safe,
  safeTx,
  delayModifierAddress,
}: {
  onboard: OnboardAPI
  safe: SafeInfo
  safeTx: SafeTransaction
  delayModifierAddress: string
}) {
  const wallet = await assertWalletChain(onboard, safe.chainId)
  const provider = createWeb3(wallet.provider)

  const delayModifier = getModuleInstance(KnownContracts.DELAY, delayModifierAddress, provider)

  const signer = provider.getSigner()
  const contract = delayModifier.connect(signer)

  const eventType = RecoveryEventType.PROPOSAL
  let recoveryTxHash: string | undefined

  try {
    // Get recovery tx hash as a form of ID for FAILED event in event bus
    recoveryTxHash = await contract.getTransactionHash(
      safeTx.data.to,
      safeTx.data.value,
      safeTx.data.data,
      safeTx.data.operation,
    )

    const tx = await contract.execTransactionFromModule(
      safeTx.data.to,
      safeTx.data.value,
      safeTx.data.data,
      safeTx.data.operation,
    )

    waitForRecoveryTx({
      moduleAddress: delayModifierAddress,
      recoveryTxHash,
      eventType,
      tx,
    })
  } catch (error) {
    recoveryDispatch(RecoveryEvent.FAILED, {
      moduleAddress: delayModifierAddress,
      recoveryTxHash,
      eventType,
      error: asError(error),
    })

    throw error
  }
}

export async function dispatchRecoveryExecution({
  onboard,
  chainId,
  args,
  delayModifierAddress,
}: {
  onboard: OnboardAPI
  chainId: string
  args: TransactionAddedEvent['args']
  delayModifierAddress: string
}) {
  const wallet = await assertWalletChain(onboard, chainId)
  const provider = createWeb3(wallet.provider)

  const delayModifier = getModuleInstance(KnownContracts.DELAY, delayModifierAddress, provider)

  const signer = provider.getSigner()

  const eventType = RecoveryEventType.EXECUTION

  try {
    const tx = await delayModifier.connect(signer).executeNextTx(args.to, args.value, args.data, args.operation)

    waitForRecoveryTx({
      moduleAddress: delayModifierAddress,
      recoveryTxHash: args.txHash,
      eventType,
      tx,
    })
  } catch (error) {
    recoveryDispatch(RecoveryEvent.FAILED, {
      moduleAddress: delayModifierAddress,
      recoveryTxHash: args.txHash,
      eventType,
      error: asError(error),
    })

    throw error
  }
}

export async function dispatchRecoverySkipExpired({
  onboard,
  chainId,
  delayModifierAddress,
  recoveryTxHash,
}: {
  onboard: OnboardAPI
  chainId: string
  delayModifierAddress: string
  recoveryTxHash: string
}) {
  const wallet = await assertWalletChain(onboard, chainId)
  const provider = createWeb3(wallet.provider)

  const delayModifier = getModuleInstance(KnownContracts.DELAY, delayModifierAddress, provider)

  const signer = provider.getSigner()

  const eventType = RecoveryEventType.SKIP_EXPIRED

  try {
    const tx = await delayModifier.connect(signer).skipExpired()

    waitForRecoveryTx({
      moduleAddress: delayModifierAddress,
      recoveryTxHash,
      eventType,
      tx,
    })
  } catch (error) {
    recoveryDispatch(RecoveryEvent.FAILED, {
      moduleAddress: delayModifierAddress,
      recoveryTxHash,
      eventType,
      error: asError(error),
    })

    throw error
  }
}
