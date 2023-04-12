import { getWeb3ReadOnly } from '@/hooks/wallets/web3'
import { ERC20__factory } from '@/types/contracts'
import { type TokenInfo, TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { BigNumber } from 'ethers'

export const UNLIMITED_APPROVAL_AMOUNT = BigNumber.from(2).pow(256).sub(1)

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
    decimals,
    type: TokenType.ERC20,
  }
}
