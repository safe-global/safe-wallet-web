/**
 * The contents of this file are mostly copy of https://github.com/ethers-io/ext-utils-optimism
 *
 * We had to make some small modifications to the estimateGas function in order to make it compatible
 * with the Safe contracts.
 */
import type { JsonRpcProvider, Overrides, TransactionLike, TransactionRequest } from 'ethers'
import { copyRequest, resolveAddress, resolveProperties, Contract, Transaction } from 'ethers'

const fullBytes32 = '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'

const gasPriceOracleAddress = '0x420000000000000000000000000000000000000F'

const gasPriceOracleAbi = [
  'function baseFee() view returns (uint)',
  'function decimals() view returns (uint)',
  'function gasPrice() view returns (uint)',
  'function getL1Fee(bytes data) view returns (uint)',
  'function getL1GasUsed(bytes data) view returns (uint)',
  'function l1BaseFee() view returns (uint)',
  'function overhead() view returns (uint)',
  'function scalar() view returns (uint)',
  'function version() view returns (string)',
]

async function getPriceOracle(provider: JsonRpcProvider): Promise<{ contract: Contract; provider: JsonRpcProvider }> {
  return {
    contract: new Contract(gasPriceOracleAddress, gasPriceOracleAbi, provider),
    provider,
  }
}

export type GasResult = {
  gas: bigint
  gasL1: bigint
  gasL2: bigint
}

export async function estimateGas(_tx: TransactionRequest, _provider: JsonRpcProvider): Promise<GasResult> {
  const { contract, provider } = await getPriceOracle(_provider)

  const tx = copyRequest(_tx)
  tx.type = 2

  const { to, from } = await resolveProperties({
    to: tx.to ? resolveAddress(tx.to, provider) : undefined,
    from: tx.from ? resolveAddress(tx.from, provider) : undefined,
  })

  if (to != null) {
    tx.to = to
  }

  // Transaction.from will throw if the from field is present as it will try to check for a signature,
  // but we don't have a signature on a Transaction request
  delete tx.from
  const txObj = Transaction.from(<TransactionLike<string>>tx)

  // If we had a from field, we need to add it back to the tx
  // otherwise the estimateGas will fail
  if (from != null) {
    tx.from = from
  }

  // Unsigned transactions need a dummy signature added to correctly
  // simulate the length, but things like nonce could still cause a
  // discrepency. It is recommended passing in a fully populated
  // transaction.
  if (txObj.signature == null) {
    txObj.signature = {
      r: fullBytes32,
      s: fullBytes32,
      yParity: 1,
    }
  }
  // Get the L2 gas limit (if not present)
  if (_tx.gasLimit == null) {
    txObj.gasLimit = await provider.estimateGas(tx)
  }
  const gasL2 = txObj.gasLimit

  // Compute the sign of the serialized transaction
  const dataL1 = txObj.serialized

  // Allow overriding the blockTag
  const options: Overrides = {}
  if (_tx.blockTag) {
    options.blockTag = _tx.blockTag
  }

  // Compute the L1 gas
  const gasL1 = await contract.getL1GasUsed(dataL1, options)

  return { gas: gasL1 + gasL2, gasL1, gasL2 }
}
