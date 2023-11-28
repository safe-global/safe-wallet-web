import { getModuleInstance, KnownContracts } from '@gnosis.pm/zodiac'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { SafeTransaction } from '@safe-global/safe-core-sdk-types'
import type { ContractTransaction } from 'ethers'
import type { OnboardAPI } from '@web3-onboard/core'
import type { TransactionAddedEvent } from '@gnosis.pm/zodiac/dist/cjs/types/Delay'
import { createWeb3 } from '@/hooks/wallets/web3'

import { didReprice, didRevert } from '@/utils/ethers-utils'
import { recoveryDispatch, RecoveryEvent } from './recoveryEvents'
import { asError } from '@/services/exceptions/utils'
import { assertWalletChain } from '../tx/tx-sender/sdk'

function waitForRecoveryTx(moduleAddress: string, recoveryTxHash: string, tx: ContractTransaction) {
  const payload = {
    moduleAddress,
    recoveryTxHash,
  }

  recoveryDispatch(RecoveryEvent.PROCESSING, payload)

  tx.wait()
    .then((receipt) => {
      if (didRevert(receipt)) {
        recoveryDispatch(RecoveryEvent.REVERTED, {
          ...payload,
          error: new Error('Transaction reverted by EVM'),
        })
      } else {
        recoveryDispatch(RecoveryEvent.PROCESSED, payload)
      }
    })
    .catch((error) => {
      if (didReprice(error)) {
        recoveryDispatch(RecoveryEvent.PROCESSED, payload)
      } else {
        recoveryDispatch(RecoveryEvent.FAILED, {
          ...payload,
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

  let recoveryTxHash: string | undefined
  let tx: ContractTransaction | undefined

  const contract = delayModifier.connect(signer)

  try {
    // Get recovery tx hash as a form of ID for event bus
    recoveryTxHash = await contract.getTransactionHash(
      safeTx.data.to,
      safeTx.data.value,
      safeTx.data.data,
      safeTx.data.operation,
    )

    recoveryDispatch(RecoveryEvent.EXECUTING, {
      moduleAddress: delayModifierAddress,
      recoveryTxHash: recoveryTxHash,
    })
  } catch (error) {
    recoveryDispatch(RecoveryEvent.FAILED, {
      moduleAddress: delayModifierAddress,
      error: asError(error),
    })

    throw error
  }

  try {
    tx = await contract.execTransactionFromModule(
      safeTx.data.to,
      safeTx.data.value,
      safeTx.data.data,
      safeTx.data.operation,
    )
  } catch (error) {
    recoveryDispatch(RecoveryEvent.FAILED, {
      moduleAddress: delayModifierAddress,
      recoveryTxHash,
      error: asError(error),
    })

    throw error
  }

  waitForRecoveryTx(delayModifierAddress, recoveryTxHash, tx)
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

  let tx: ContractTransaction | undefined

  try {
    tx = await delayModifier.connect(signer).executeNextTx(args.to, args.value, args.data, args.operation)

    recoveryDispatch(RecoveryEvent.EXECUTING, {
      moduleAddress: delayModifierAddress,
      recoveryTxHash: args.txHash,
    })
  } catch (error) {
    recoveryDispatch(RecoveryEvent.FAILED, {
      moduleAddress: delayModifierAddress,
      recoveryTxHash: args.txHash,
      error: asError(error),
    })

    throw error
  }

  waitForRecoveryTx(delayModifierAddress, args.txHash, tx)
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

  let tx: ContractTransaction | undefined

  try {
    tx = await delayModifier.connect(signer).skipExpired()

    recoveryDispatch(RecoveryEvent.EXECUTING, {
      moduleAddress: delayModifierAddress,
      recoveryTxHash,
    })
  } catch (error) {
    recoveryDispatch(RecoveryEvent.FAILED, {
      moduleAddress: delayModifierAddress,
      recoveryTxHash,
      error: asError(error),
    })

    throw error
  }

  waitForRecoveryTx(delayModifierAddress, recoveryTxHash, tx)
}
