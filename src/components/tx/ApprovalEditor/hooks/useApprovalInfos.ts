import useAsync from '@/hooks/useAsync'
import useBalances from '@/hooks/useBalances'
import { type Approval } from '@/security/modules/ApprovalModule'
import { ERC20__factory } from '@/types/contracts'
import { getERC20TokenInfoOnChain, UNLIMITED_APPROVAL_AMOUNT } from '@/utils/tokens'
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

const ERC20_INTERFACE = ERC20__factory.createInterface()

export const useApprovalInfos = (approvals: Approval[]) => {
  const { balances } = useBalances()

  return useAsync<ApprovalInfo[]>(
    async () =>
      Promise.all(
        approvals.map(async (approval) => {
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
      ),
    [balances.items.length, approvals],
    false, // Do not clear data on balance updates
  )
}
