import useAsync from '@/hooks/useAsync'
import useBalances from '@/hooks/useBalances'
import { type Approval, ApprovalModule } from '@/services/security/modules/ApprovalModule'
import { getERC20TokenInfoOnChain, UNLIMITED_APPROVAL_AMOUNT, UNLIMITED_PERMIT2_AMOUNT } from '@/utils/tokens'
import { type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { formatUnits } from 'ethers'
import { PSEUDO_APPROVAL_VALUES } from '../utils/approvals'
import { useMemo } from 'react'
import { type EIP712TypedData, type TokenInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { sameAddress } from '@/utils/addresses'

export type ApprovalInfo = {
  tokenInfo: (Omit<TokenInfo, 'logoUri' | 'name'> & { logoUri?: string }) | undefined
  tokenAddress: string
  spender: any
  amount: any
  amountFormatted: string
  method: Approval['method']
  /** Index of approval transaction within (batch) transaction */
  transactionIndex: number
}

const ApprovalModuleInstance = new ApprovalModule()

export const useApprovalInfos = (payload: {
  safeTransaction?: SafeTransaction
  safeMessage?: EIP712TypedData
}): [ApprovalInfo[] | undefined, Error | undefined, boolean] => {
  const { safeTransaction, safeMessage } = payload
  const { balances } = useBalances()
  const approvals = useMemo(() => {
    if (safeTransaction) {
      return ApprovalModuleInstance.scanTransaction({ safeTransaction })
    }
    if (safeMessage) {
      return ApprovalModuleInstance.scanMessage({ safeMessage })
    }
  }, [safeMessage, safeTransaction])

  const hasApprovalSignatures = !!approvals && !!approvals.payload && approvals.payload.length > 0

  const [approvalInfos, error, loading] = useAsync<ApprovalInfo[] | undefined>(
    async () => {
      if (!hasApprovalSignatures) return

      return Promise.all(
        approvals.payload.map(async (approval) => {
          let tokenInfo: Omit<TokenInfo, 'name' | 'logoUri'> | undefined = balances.items.find((item) =>
            sameAddress(item.tokenInfo.address, approval.tokenAddress),
          )?.tokenInfo

          if (!tokenInfo) {
            tokenInfo = await getERC20TokenInfoOnChain(approval.tokenAddress)
          }

          const amountFormatted =
            UNLIMITED_APPROVAL_AMOUNT == approval.amount || UNLIMITED_PERMIT2_AMOUNT == approval.amount
              ? PSEUDO_APPROVAL_VALUES.UNLIMITED
              : formatUnits(approval.amount, tokenInfo?.decimals)

          return { ...approval, tokenInfo, amountFormatted }
        }),
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasApprovalSignatures, balances.items.length],
    false, // Do not clear data on balance updates
  )

  return [hasApprovalSignatures ? approvalInfos : [], error, loading]
}
