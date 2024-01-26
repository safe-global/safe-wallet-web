import { getWeb3ReadOnly } from '@/hooks/wallets/web3'
import { ERC20__factory } from '@/types/contracts'
import { type TokenInfo, TokenType } from '@safe-global/safe-gateway-typescript-sdk'

export const UNLIMITED_APPROVAL_AMOUNT = 2n ** 256n - 1n
export const UNLIMITED_PERMIT2_AMOUNT = 2n ** 160n - 1n

/**
 * Fetches ERC20 token symbol and decimals from on-chain.
 * @param address address of erc20 token
 */
export const getERC20TokenInfoOnChain = async (
  address: string,
): Promise<Omit<TokenInfo, 'name' | 'logoUri'> | undefined> => {
  const web3 = getWeb3ReadOnly()
  if (!web3) return

  const erc20 = ERC20__factory.connect(address, web3)
  const [symbol, decimals] = await Promise.all([erc20.symbol(), erc20.decimals()])
  return {
    address,
    symbol,
    decimals: Number(decimals),
    type: TokenType.ERC20,
  }
}
