import { MetaTransactionData } from '@gnosis.pm/safe-core-sdk-types'
import { getSpendingLimitInterface, getSpendingLimitModuleAddress } from '@/services/contracts/spendingLimitContracts'
import { parseUnits } from '@ethersproject/units'
import { createMultiSendTx } from '@/services/tx/txSender'
import { getSafeSDK } from '@/hooks/coreSDK/safeCoreSDK'
import { NewSpendingLimitData } from '@/components/settings/SpendingLimits/NewSpendingLimit'
import { SpendingLimitState } from '@/store/spendingLimitsSlice'
import { currentMinutes } from '@/utils/date'

export const createAddDelegateTx = (delegate: string, spendingLimitAddress: string): MetaTransactionData => {
  const spendingLimitInterface = getSpendingLimitInterface()

  const data = spendingLimitInterface.encodeFunctionData('addDelegate', [delegate])

  return {
    to: spendingLimitAddress,
    value: '0',
    data,
  }
}

export const createResetAllowanceTx = (
  delegate: string,
  tokenAddress: string,
  spendingLimitAddress: string,
): MetaTransactionData => {
  const spendingLimitInterface = getSpendingLimitInterface()

  const data = spendingLimitInterface.encodeFunctionData('resetAllowance', [delegate, tokenAddress])

  return {
    to: spendingLimitAddress,
    value: '0',
    data,
  }
}

export const createSetAllowanceTx = (
  delegate: string,
  tokenAddress: string,
  amountInWei: string,
  resetTimeMin: number,
  resetBaseMin: number,
  spendingLimitAddress: string,
) => {
  const spendingLimitInterface = getSpendingLimitInterface()

  const data = spendingLimitInterface.encodeFunctionData('setAllowance', [
    delegate,
    tokenAddress,
    amountInWei,
    resetTimeMin,
    resetBaseMin,
  ])

  return {
    to: spendingLimitAddress,
    value: '0',
    data,
  }
}

export const createNewSpendingLimitTx = async (
  data: NewSpendingLimitData,
  spendingLimits: SpendingLimitState[],
  chainId: string,
  tokenDecimals?: number,
  existingSpendingLimit?: SpendingLimitState,
) => {
  const sdk = getSafeSDK()
  const spendingLimitAddress = getSpendingLimitModuleAddress(chainId)
  if (!spendingLimitAddress || !sdk) return

  const txs: MetaTransactionData[] = []

  const isSpendingLimitEnabled = await sdk.isModuleEnabled(spendingLimitAddress)
  if (!isSpendingLimitEnabled) {
    const enableModuleTx = await sdk.getEnableModuleTx(spendingLimitAddress)

    const tx = {
      to: enableModuleTx.data.to,
      value: '0',
      data: enableModuleTx.data.data,
    }
    txs.push(tx)
  }

  const existingDelegate = spendingLimits.find((spendingLimit) => spendingLimit.beneficiary === data.beneficiary)
  if (!existingDelegate) {
    txs.push(createAddDelegateTx(data.beneficiary, spendingLimitAddress))
  }

  if (existingSpendingLimit && existingSpendingLimit.spent !== '0') {
    txs.push(createResetAllowanceTx(data.beneficiary, data.tokenAddress, spendingLimitAddress))
  }

  const tx = createSetAllowanceTx(
    data.beneficiary,
    data.tokenAddress,
    parseUnits(data.amount, tokenDecimals).toString(),
    parseInt(data.resetTime),
    data.resetTime !== '0' ? currentMinutes() - 30 : 0,
    spendingLimitAddress,
  )

  txs.push(tx)

  return createMultiSendTx(txs)
}
