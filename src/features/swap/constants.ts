import { id } from 'ethers'

export const SWAP_TITLE = 'Safe Swap'
export const SWAP_ORDER_TITLE = 'Swap order'
export const LIMIT_ORDER_TITLE = 'Limit order'
export const TWAP_ORDER_TITLE = 'TWAP order'

export const SWAP_FEE_RECIPIENT = '0x63695Eee2c3141BDE314C5a6f89B98E62808d716'

export const CREATE_WITH_CONTEXT_SIGNATURE = id('createWithContext((address,bytes32,bytes),address,bytes,bool)').slice(
  0,
  10,
)
export const COMPOSABLE_COW_ADDRESS = '0xfdaFc9d1902f4e0b84f65F49f244b32b31013b74'
