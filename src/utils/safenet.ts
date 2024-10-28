import type { SafeNetBalanceEntity, SafeNetConfigEntity } from '@/store/safenet'
import { TokenType, type SafeBalanceResponse } from '@safe-global/safe-gateway-typescript-sdk'

const isSupportedChain = (chainId: number, safeNetConfig: SafeNetConfigEntity) => {
  return safeNetConfig.chains.includes(chainId)
}

const convertSafeNetBalanceToSafeClientGatewayBalance = (
  safeNetBalance: SafeNetBalanceEntity,
  safeNetConfig: SafeNetConfigEntity,
  chainId: number,
): SafeBalanceResponse => {
  const balances: SafeBalanceResponse = {
    fiatTotal: safeNetBalance.fiatTotal,
    items: [],
  }

  for (const [tokenName, balance] of Object.entries(safeNetBalance)) {
    const tokenAddress = safeNetConfig.tokens[tokenName][chainId]
    if (!tokenAddress) {
      continue
    }

    balances.items.push({
      tokenInfo: {
        type: TokenType.ERC20,
        address: tokenAddress,
        decimals: tokenName === 'USDC' ? 6 : 18,
        symbol: tokenName,
        name: `${tokenName} (SafeNet)`,
        logoUri: '',
      },
      balance,
      fiatBalance: '0',
      fiatConversion: '0',
    })
  }

  return balances
}

export { isSupportedChain, convertSafeNetBalanceToSafeClientGatewayBalance }
