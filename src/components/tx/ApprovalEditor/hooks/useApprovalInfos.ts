import useAsync from '@/hooks/useAsync'
import useBalances from '@/hooks/useBalances'
import { ERC20__factory } from '@/types/contracts'
import { getERC20TokenInfoOnChain, UNLIMITED_APPROVAL_AMOUNT } from '@/utils/tokens'
import { type BaseTransaction } from '@safe-global/safe-apps-sdk'
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

export const useApprovalInfos = (approvalTxs: BaseTransaction[]) => {
  const { balances } = useBalances()

  return useAsync<ApprovalInfo[]>(
    async () =>
      Promise.all(
        approvalTxs.map(async (tx) => {
          const [spender, amount] = ERC20_INTERFACE.decodeFunctionData('approve', tx.data)
          let tokenInfo: Omit<TokenInfo, 'name' | 'logoUri'> | undefined = balances.items.find(
            (item) => item.tokenInfo.address === tx.to,
          )?.tokenInfo
          if (!tokenInfo) {
            tokenInfo = await getERC20TokenInfoOnChain(tx.to)
          }

          const amountFormatted = UNLIMITED_APPROVAL_AMOUNT.eq(amount)
            ? PSEUDO_APPROVAL_VALUES.UNLIMITED
            : ethers.utils.formatUnits(amount, tokenInfo?.decimals)

          return {
            tokenInfo: tokenInfo,
            tokenAddress: tx.to,
            spender: spender,
            amount: amount,
            amountFormatted,
          }
        }),
      ),
    [balances.items.length, approvalTxs],
    false, // Do not clear data on balance updates
  )
}
