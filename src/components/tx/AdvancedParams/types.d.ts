export enum AdvancedField {
  nonce = 'nonce',
  userNonce = 'userNonce',
  gasLimit = 'gasLimit',
  maxFeePerGas = 'maxFeePerGas',
  maxPriorityFeePerGas = 'maxPriorityFeePerGas',
  safeTxGas = 'safeTxGas',
}

export type AdvancedParameters = Partial<{
  [AdvancedField.nonce]: number
  [AdvancedField.userNonce]: number
  [AdvancedField.gasLimit]: BigNumber
  [AdvancedField.maxFeePerGas]: BigNumber
  [AdvancedField.maxPriorityFeePerGas]: BigNumber
  [AdvancedField.safeTxGas]: number
}>
