import useAsync from '@/hooks/useAsync'
import useBalances from '@/hooks/useBalances'
import { ApprovalModule } from '@/services/security/modules/ApprovalModule'
import { getERC20TokenInfoOnChain, UNLIMITED_APPROVAL_AMOUNT } from '@/utils/tokens'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { ethers } from 'ethers'
import { PSEUDO_APPROVAL_VALUES } from '../utils/approvals'
import { useMemo } from 'react'

export type ApprovalInfo = {
  tokenInfo: (Omit<TokenInfo, 'logoUri' | 'name'> & { logoUri?: string }) | undefined
  tokenAddress: string
  spender: any
  amount: any
  amountFormatted: string
}

const ApprovalModuleInstance = new ApprovalModule()

export const useApprovalInfos = (
  safeTransaction: SafeTransaction | undefined,
): [ApprovalInfo[] | undefined, Error | undefined, boolean] => {
  const { balances } = useBalances()
  const approvals = useMemo(() => {
    if (!safeTransaction) return

    return ApprovalModuleInstance.scanTransaction({ safeTransaction })
  }, [safeTransaction])

  const hasApprovalSignatures = !!approvals && !!approvals.payload && approvals.payload.length > 0

  const [approvalInfos, error, loading] = useAsync<ApprovalInfo[] | undefined>(
    async () => {
      if (!hasApprovalSignatures) return

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasApprovalSignatures, balances.items.length],
    false, // Do not clear data on balance updates
  )

  return [hasApprovalSignatures ? approvalInfos : [], error, loading]
}
