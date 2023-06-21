import useAsync from '@/hooks/useAsync'
import useBalances from '@/hooks/useBalances'
import { ApprovalModule, type ApprovalModuleResponse } from '@/services/security/modules/ApprovalModule'
import type { SecurityResponse } from '@/services/security/modules/types'
import { getERC20TokenInfoOnChain, UNLIMITED_APPROVAL_AMOUNT } from '@/utils/tokens'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { ethers } from 'ethers'
import { PSEUDO_APPROVAL_VALUES } from '../utils/approvals'

export type ApprovalInfo = {
  tokenInfo: (Omit<TokenInfo, 'logoUri' | 'name'> & { logoUri?: string }) | undefined
  tokenAddress: string
  spender: any
  amount: any
  amountFormatted: string
}

const ApprovalModuleInstance = new ApprovalModule()

const useApprovalData = (safeTransaction: SafeTransaction | undefined) => {
  return useAsync<SecurityResponse<ApprovalModuleResponse>>(() => {
    if (!safeTransaction) {
      return
    }

    return ApprovalModuleInstance.scanTransaction({ safeTransaction })
  }, [safeTransaction])
}

export const useApprovalInfos = (safeTransaction: SafeTransaction | undefined) => {
  const [approvals] = useApprovalData(safeTransaction)

  const { balances } = useBalances()

  return useAsync<ApprovalInfo[]>(
    async () => {
      if (!approvals || !approvals.payload || approvals.payload.length === 0) return Promise.resolve([])

      return Promise.all(
        approvals.payload.map(async (approval) => {
          let tokenInfo: Omit<TokenInfo, 'name' | 'logoUri'> | undefined = balances.items.find(
            (item) => item.tokenInfo.address === approval.tokenAddress,
          )?.tokenInfo
          if (!tokenInfo) {
            tokenInfo = await getERC20TokenInfoOnChain(approval.tokenAddress)
          }

          const amountFormatted = UNLIMITED_APPROVAL_AMOUNT.eq(approval.amount)
            ? PSEUDO_APPROVAL_VALUES.UNLIMITED
            : ethers.utils.formatUnits(approval.amount, tokenInfo?.decimals)

          return { ...approval, tokenInfo: tokenInfo, amountFormatted }
        }),
      )
    },
    [balances.items.length, approvals],
    false, // Do not clear data on balance updates
  )
}
