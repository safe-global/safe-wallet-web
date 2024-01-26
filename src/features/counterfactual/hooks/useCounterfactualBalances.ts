import useAsync from '@/hooks/useAsync'
import { useCurrentChain } from '@/hooks/useChains'
import { useWeb3 } from '@/hooks/wallets/web3'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import { type SafeBalanceResponse, TokenType } from '@safe-global/safe-gateway-typescript-sdk'

// TODO: Think of a strategy to fetch balances, i.e. poll vs only once
export const useCounterfactualBalances = (safeAddress: string, pollCount: number) => {
  const chain = useCurrentChain()
  const web3 = useWeb3()

  return useAsync(async () => {
    const balance = await web3?.getBalance(safeAddress)

    return <SafeBalanceResponse>{
      fiatTotal: '0',
      items: [
        {
          tokenInfo: {
            type: TokenType.NATIVE_TOKEN,
            address: ZERO_ADDRESS,
            ...chain?.nativeCurrency,
          },
          balance: balance ? balance.toString() : '0',
          fiatBalance: '0',
          fiatConversion: '0',
        },
      ],
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chain?.nativeCurrency, safeAddress, web3, pollCount])
}
