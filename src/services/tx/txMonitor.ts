import { didRevert } from '@/utils/ethers-utils'

import { txDispatch, TxEvent } from '@/services/tx/txEvents'

import type { JsonRpcProvider } from '@ethersproject/providers'
import { POLLING_INTERVAL } from '@/config/constants'
import { Errors, logError } from '@/services/exceptions'
import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'

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

const getRelayTxStatus = async (taskId: string): Promise<{ task: TransactionStatusResponse } | undefined> => {
  const url = getTaskTrackingUrl(taskId)

  let response

  try {
    response = await fetch(url).then((res) => {
      // 404s can happen if gelato is a bit slow with picking up the taskID
      if (res.status !== 404 && res.ok) {
        return res.json()
      }

      return res.json().then((data) => {
        throw new Error(`${res.status} - ${res.statusText}: ${data?.message}`)
      })
    })
  } catch (error) {
    logError(Errors._632, (error as Error).message)
    return
  }

  return response
}

const WAIT_FOR_RELAY_TIMEOUT = 3 * 60_000 // 3 minutes

export const waitForRelayedTx = (taskId: string, txIds: string[], safeAddress: string, groupKey?: string): void => {
  let intervalId: NodeJS.Timeout
  let failAfterTimeoutId: NodeJS.Timeout

  intervalId = setInterval(async () => {
    const status = await getRelayTxStatus(taskId)

    // 404
    if (!status) {
      return
    }

    switch (status.task.taskState) {
      case TaskState.ExecSuccess:
        txIds.forEach((txId) =>
          txDispatch(TxEvent.PROCESSED, {
            txId,
            groupKey,
            safeAddress,
          }),
        )
        break
      case TaskState.ExecReverted:
        txIds.forEach((txId) =>
          txDispatch(TxEvent.REVERTED, {
            txId,
            error: new Error(`Relayed transaction reverted by EVM.`),
            groupKey,
          }),
        )
        break
      case TaskState.Blacklisted:
        txIds.forEach((txId) =>
          txDispatch(TxEvent.FAILED, {
            txId,
            error: new Error(`Relayed transaction was blacklisted by relay provider.`),
            groupKey,
          }),
        )
        break
      case TaskState.Cancelled:
        txIds.forEach((txId) =>
          txDispatch(TxEvent.FAILED, {
            txId,
            error: new Error(`Relayed transaction was cancelled by relay provider.`),
            groupKey,
          }),
        )
        break
      case TaskState.NotFound:
        txIds.forEach((txId) =>
          txDispatch(TxEvent.FAILED, {
            txId,
            error: new Error(`Relayed transaction was not found.`),
            groupKey,
          }),
        )
        break
      default:
        // Don't clear interval as we're still waiting for the tx to be relayed
        return
    }

    clearTimeout(failAfterTimeoutId)
    clearInterval(intervalId)
  }, POLLING_INTERVAL)

  failAfterTimeoutId = setTimeout(() => {
    txIds.forEach((txId) =>
      txDispatch(TxEvent.FAILED, {
        txId,
        error: new Error(
          `Transaction not relayed in ${
            WAIT_FOR_RELAY_TIMEOUT / 60_000
          } minutes. Be aware that it might still be relayed.`,
        ),
        groupKey,
      }),
    )

    clearInterval(intervalId)
  }, WAIT_FOR_RELAY_TIMEOUT)
}

export const waitForCreateSafeTx = (taskId: string, setStatus: (value: SafeCreationStatus) => void): void => {
  let intervalId: NodeJS.Timeout
  let failAfterTimeoutId: NodeJS.Timeout

  intervalId = setInterval(async () => {
    const status = await getRelayTxStatus(taskId)

    // 404
    if (!status) {
      return
    }

    switch (status.task.taskState) {
      case TaskState.ExecSuccess:
        setStatus(SafeCreationStatus.SUCCESS)
        break
      case TaskState.ExecReverted:
      case TaskState.Blacklisted:
      case TaskState.Cancelled:
      case TaskState.NotFound:
        setStatus(SafeCreationStatus.ERROR)
        break
      default:
        // Don't clear interval as we're still waiting for the tx to be relayed
        return
    }

    clearTimeout(failAfterTimeoutId)
    clearInterval(intervalId)
  }, POLLING_INTERVAL)

  failAfterTimeoutId = setTimeout(() => {
    setStatus(SafeCreationStatus.ERROR)

    clearInterval(intervalId)
  }, WAIT_FOR_RELAY_TIMEOUT)
}
