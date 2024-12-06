import { faker } from '@faker-js/faker'
import { getDomainHash } from '.'
import { AbiCoder, keccak256 } from 'ethers'

// <= 1.2.0
// keccak256("EIP712Domain(address verifyingContract)");
const OLD_DOMAIN_TYPEHASH = '0x035aff83d86937d35b32e04f0ddc6ff469290eef2f1b692d8a815c89404d4749'

// >= 1.3.0
// keccak256("EIP712Domain(uint256 chainId,address verifyingContract)");
const NEW_DOMAIN_TYPEHASH = '0x47e79534a245952e8b16893a336b85a3d9ea9fa8c573f3d803afb92a79469218'

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
})
