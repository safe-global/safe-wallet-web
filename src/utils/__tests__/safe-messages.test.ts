import { ethers } from 'ethers'
import type { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { generateSafeMessageTypedData } from '../safe-messages'

const MOCK_ADDRESS = ethers.utils.hexZeroPad('0x123', 20)

describe('safe-messages', () => {
  describe('createSafeMessage', () => {
    it('should generate the correct types for a EIP-191 message', () => {
      const safe = {
        address: {
          value: MOCK_ADDRESS,
        },
        chainId: 1,
      } as unknown as SafeInfo

      const message = 'Hello world!'

      const safeMessage = generateSafeMessageTypedData(safe, message)

      expect(safeMessage).toEqual({
        domain: {
          chainId: 1,
          verifyingContract: MOCK_ADDRESS,
        },
        types: {
          SafeMessage: [{ name: 'message', type: 'bytes' }],
        },
        message: {
          message: '0xaa05af77f274774b8bdc7b61d98bc40da523dc2821fdea555f4d6aa413199bcc',
        },
      })
    })

    it('should generate the correct types for an EIP-712 message', () => {
      const safe = {
        address: {
          value: MOCK_ADDRESS,
        },
        chainId: 1,
      } as unknown as SafeInfo

      const message = {
        domain: {
          chainId: 5,
          name: 'Ether Mail',
          verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
          version: '1',
        },
        message: {
          contents: 'Hello, Bob!',
          from: {
            name: 'Cow',
            wallet: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
          },
          to: {
            name: 'Bob',
            wallet: '0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB',
          },
        },
        primaryType: 'Mail',
        types: {
          EIP712Domain: [
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'version',
              type: 'string',
            },
            {
              name: 'chainId',
              type: 'uint256',
            },
            {
              name: 'verifyingContract',
              type: 'address',
            },
          ],
          Mail: [
            {
              name: 'from',
              type: 'Person',
            },
            {
              name: 'to',
              type: 'Person',
            },
            {
              name: 'contents',
              type: 'string',
            },
          ],
          Person: [
            {
              name: 'name',
              type: 'string',
            },
            {
              name: 'wallet',
              type: 'address',
            },
          ],
        },
      }

      const safeMessage = generateSafeMessageTypedData(safe, message)

      expect(safeMessage).toEqual({
        domain: {
          chainId: 1,
          verifyingContract: MOCK_ADDRESS,
        },
        types: {
          SafeMessage: [{ name: 'message', type: 'bytes' }],
        },
        message: {
          message: '0x37abd8589f35b81d0ed965127e85b3de86f17c06f3736cfbb5f8e67767a8dd45',
        },
      })
    })
  })
})
