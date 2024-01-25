import { Builder, type IBuilder } from '@/tests/Builder'
import { faker } from '@faker-js/faker'
import type { SafeSignature, SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'

// TODO: Convert to builder
export const createSafeTx = (data = '0x'): SafeTransaction => {
  return {
    data: {
      to: '0x0000000000000000000000000000000000000000',
      value: '0x0',
      data,
      operation: 0,
      nonce: 100,
    },
    signatures: new Map([]),
    addSignature: function (sig: SafeSignature): void {
      this.signatures.set(sig.signer, sig)
    },
    encodedSignatures: function (): string {
      return Array.from(this.signatures)
        .map(([, sig]) => {
          return [sig.signer, sig.data].join(' = ')
        })
        .join('; ')
    },
  } as SafeTransaction
}

export function safeTxBuilder(): IBuilder<SafeTransaction> {
  return Builder.new<SafeTransaction>().with({
    data: {
      to: faker.finance.ethereumAddress(),
      value: '0x0',
      data: faker.string.hexadecimal({ length: faker.number.int({ max: 500 }) }),
      operation: 0,
      nonce: faker.number.int(),
      safeTxGas: faker.number.toString(),
      gasPrice: faker.number.toString(),
      gasToken: ZERO_ADDRESS,
      baseGas: faker.number.toString(),
      refundReceiver: faker.finance.ethereumAddress(),
    },
    signatures: new Map([]),
    addSignature: function (sig: SafeSignature): void {
      this.signatures!.set(sig.signer, sig)
    },
    encodedSignatures: function (): string {
      return Array.from(this.signatures!)
        .map(([, sig]) => {
          return [sig.signer, sig.data].join(' = ')
        })
        .join('; ')
    },
  })
}

export function safeSignatureBuilder(): IBuilder<SafeSignature> {
  return Builder.new<SafeSignature>().with({
    signer: faker.finance.ethereumAddress(),
    data: faker.string.hexadecimal({ length: faker.number.int({ max: 500 }) }),
  })
}
