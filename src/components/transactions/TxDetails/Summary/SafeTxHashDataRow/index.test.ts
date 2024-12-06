import { faker } from '@faker-js/faker'
import { getDomainHash, getMessageHash } from '.'
import { AbiCoder, keccak256 } from 'ethers'
import type { SafeTransactionData, SafeVersion } from '@safe-global/safe-core-sdk-types'

// <= 1.2.0
// keccak256("EIP712Domain(address verifyingContract)");
const OLD_DOMAIN_TYPEHASH = '0x035aff83d86937d35b32e04f0ddc6ff469290eef2f1b692d8a815c89404d4749'

// >= 1.3.0
// keccak256("EIP712Domain(uint256 chainId,address verifyingContract)");
const NEW_DOMAIN_TYPEHASH = '0x47e79534a245952e8b16893a336b85a3d9ea9fa8c573f3d803afb92a79469218'

// < 1.0.0
// keccak256("SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 dataGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)");
const OLD_SAFE_TX_TYPEHASH = '0x14d461bc7412367e924637b363c7bf29b8f47e2f84869f4426e5633d8af47b20'

// >= 1.0.0
// keccak256("SafeTx(address to,uint256 value,bytes data,uint8 operation,uint256 safeTxGas,uint256 baseGas,uint256 gasPrice,address gasToken,address refundReceiver,uint256 nonce)");
const NEW_SAFE_TX_TYPEHASH = '0xbb8310d486368db6bd6f849402fdd73ad53d316b5a4b2644ad6efe0f941286d8'

describe('SafeTxHashDataRow', () => {
  describe('getDomainHash', () => {
    it.each(['1.0.0' as const, '1.1.1' as const, '1.2.0' as const])(
      'should return the domain hash without chain ID for version %s',
      (version) => {
        const chainId = faker.string.numeric()
        const safeAddress = faker.finance.ethereumAddress()

        const result = getDomainHash({ chainId, safeAddress, safeVersion: version })

        expect(result).toEqual(
          keccak256(AbiCoder.defaultAbiCoder().encode(['bytes32', 'address'], [OLD_DOMAIN_TYPEHASH, safeAddress])),
        )
      },
    )

    it.each(['1.3.0' as const, '1.4.1' as const])(
      'should return the domain hash with chain ID for version %s',
      (version) => {
        const chainId = faker.string.numeric()
        const safeAddress = faker.finance.ethereumAddress()

        const result = getDomainHash({ chainId, safeAddress, safeVersion: version })

        expect(result).toEqual(
          keccak256(
            AbiCoder.defaultAbiCoder().encode(
              ['bytes32', 'uint256', 'address'],
              [NEW_DOMAIN_TYPEHASH, chainId, safeAddress],
            ),
          ),
        )
      },
    )
  })

  describe('getMessageHash', () => {
    it.each([
      ['0.1.0' as SafeVersion, OLD_SAFE_TX_TYPEHASH],
      ['1.0.0' as const, NEW_SAFE_TX_TYPEHASH],
      ['1.1.1' as const, NEW_SAFE_TX_TYPEHASH],
      ['1.2.0' as const, NEW_SAFE_TX_TYPEHASH],
      ['1.3.0' as const, NEW_SAFE_TX_TYPEHASH],
      ['1.4.1' as const, NEW_SAFE_TX_TYPEHASH],
    ])('should return the message hash for version %s', (version, typehash) => {
      const SafeTx: SafeTransactionData = {
        to: faker.finance.ethereumAddress(),
        value: faker.string.numeric(),
        data: faker.string.hexadecimal({ length: 30 }),
        operation: faker.number.int({ min: 0, max: 1 }),
        safeTxGas: faker.string.numeric(),
        baseGas: faker.string.numeric(), // <1.0.0 is dataGas
        gasPrice: faker.string.numeric(),
        gasToken: faker.finance.ethereumAddress(),
        refundReceiver: faker.finance.ethereumAddress(),
        nonce: faker.number.int({ min: 0, max: 69 }),
      }

      const result = getMessageHash({ safeVersion: version, safeTxData: SafeTx })

      expect(result).toEqual(
        keccak256(
          AbiCoder.defaultAbiCoder().encode(
            [
              'bytes32',
              'address', // to
              'uint256', // value
              'bytes32', // data
              'uint8', // operation
              'uint256', // safeTxGas
              'uint256', // dataGas/baseGas
              'uint256', // gasPrice
              'address', // gasToken
              'address', // refundReceiver
              'uint256', // nonce
            ],
            [
              typehash,
              SafeTx.to,
              SafeTx.value,
              // EIP-712 expects data to be hashed
              keccak256(SafeTx.data),
              SafeTx.operation,
              SafeTx.safeTxGas,
              SafeTx.baseGas,
              SafeTx.gasPrice,
              SafeTx.gasToken,
              SafeTx.refundReceiver,
              SafeTx.nonce,
            ],
          ),
        ),
      )
    })
  })
})
