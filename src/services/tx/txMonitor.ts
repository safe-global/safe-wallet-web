import { didRevert } from '@/utils/ethers-utils'

import { txDispatch, TxEvent } from '@/services/tx/txEvents'

import type { JsonRpcProvider } from '@ethersproject/providers'
import { POLLING_INTERVAL } from '@/config/constants'
import { Errors, logError } from '@/services/exceptions'

// Provider must be passed as an argument as it is undefined until initialised by `useInitWeb3`
export const waitForTx = async (provider: JsonRpcProvider, txId: string, txHash: string) => {
  const TIMEOUT_MINUTES = 6.5

  try {
    // Return receipt after 1 additional block was mined/validated or until timeout
    // https://docs.ethers.io/v5/single-page/#/v5/api/providers/provider/-%23-Provider-waitForTransaction
    const receipt = await provider.waitForTransaction(txHash, 1, TIMEOUT_MINUTES * 60_000)

    if (!receipt) {
      throw new Error(
        `Transaction not processed in ${TIMEOUT_MINUTES} minutes. Be aware that it might still be processed.`,
      )
    }

    if (didRevert(receipt)) {
      txDispatch(TxEvent.REVERTED, {
        txId,
        error: new Error(`Transaction reverted by EVM.`),
      })
    }

    // Tx successfully mined/validated but we don't dispatch SUCCESS as this may be faster than our indexer
  } catch (error) {
    txDispatch(TxEvent.FAILED, {
      txId,
      error: error as Error,
    })
  }
}

enum TaskState {
  CheckPending = 'CheckPending',
  ExecPending = 'ExecPending',
  ExecSuccess = 'ExecSuccess',
  ExecReverted = 'ExecReverted',
  WaitingForConfirmation = 'WaitingForConfirmation',
  Blacklisted = 'Blacklisted',
  Cancelled = 'Cancelled',
  NotFound = 'NotFound',
}

type TransactionStatusResponse = {
  chainId: number
  taskId: string
  taskState: TaskState
  creationDate: string
  lastCheckDate?: string
  lastCheckMessage?: string
  transactionHash?: string
  blockNumber?: number
  executionDate?: string
}

const TASK_STATUS_URL = 'https://relay.gelato.digital/tasks/status'
const getTaskTrackingUrl = (taskId: string) => `${TASK_STATUS_URL}/${taskId}`

export const waitForRelayedTx = (taskId: string, txId: string): void => {
  // A small delay is necessary before the initial polling as the task status
  // is not immediately available after the sponsoredCall request
  const INITIAL_POLLING_DELAY = 2_000

  const TIMEOUT_MINUTES = 3
  let timeoutId: NodeJS.Timeout

  const checkTxStatus = async () => {
    const url = getTaskTrackingUrl(taskId)

    let response
    try {
      response = await fetch(url).then((res) => {
        if (res.ok) {
          return res.json()
        }

        return res.json().then((data) => {
          throw new Error(`${res.status} - ${res.statusText}: ${data?.error?.message}`)
        })
      })
    } catch (error) {
      logError(Errors._632, (error as Error).message)
    }

    const task = response?.task as TransactionStatusResponse

    switch (task.taskState) {
      case TaskState.CheckPending:
      case TaskState.ExecPending:
      case TaskState.WaitingForConfirmation:
        // still pending we set a timeout to check again
        timeoutId = setTimeout(checkTxStatus, POLLING_INTERVAL)
        return
      case TaskState.ExecSuccess:
        txDispatch(TxEvent.PROCESSED, {
          txId,
        })
        return
      case TaskState.ExecReverted:
        txDispatch(TxEvent.REVERTED, {
          txId,
          error: new Error(`Relayed transaction reverted by EVM.`),
        })
        return
      case TaskState.Blacklisted:
        txDispatch(TxEvent.FAILED, {
          txId,
          error: new Error(`Relayed transaction was blacklisted by relay provider.`),
        })
        return
      case TaskState.Cancelled:
        txDispatch(TxEvent.FAILED, {
          txId,
          error: new Error(`Relayed transaction was cancelled by relay provider.`),
        })
        return
      case TaskState.NotFound:
      default:
        txDispatch(TxEvent.FAILED, {
          txId,
          error: new Error(`Relayed transaction was not found.`),
        })
        return
    }
  }

  setTimeout(checkTxStatus, INITIAL_POLLING_DELAY)
  setTimeout(() => {
    clearTimeout(timeoutId)
    txDispatch(TxEvent.FAILED, {
      txId,
      error: new Error(
        `Transaction not relayed in ${TIMEOUT_MINUTES} minutes. Be aware that it might still be relayed.`,
      ),
    })
  }, TIMEOUT_MINUTES * 60_000)
}
