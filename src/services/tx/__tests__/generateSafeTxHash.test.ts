import * as logErrorModule from '@/services/exceptions'
import ErrorCodes from '@/services/exceptions/ErrorCodes'
import { utils } from 'ethers'
import type { SafeInfo } from '@gnosis.pm/safe-react-gateway-sdk'

import { generateSafeTxHash } from '../generateSafeTxHash'

const typedData = {
  to: '0x65c57CC1317a1f728E921Cbf7bC08b3894196D29',
  value: '100000000000000000',
  data: '0x',
  operation: 0,
  baseGas: 0,
  gasPrice: 0,
  gasToken: '0x0000000000000000000000000000000000000000',
  refundReceiver: '0x0000000000000000000000000000000000000000',
  nonce: 25,
  safeTxGas: 0,
}

const safe = {
  address: {
    value: '0x65c57CC1317a1f728E921Cbf7bC08b3894196D29',
  },
  chainId: '5',
  version: '1.3.0',
} as SafeInfo

describe('generateSafeTxHash', () => {
  it('generates a safeTxHash', () => {
    const safeTxHash = '0x4ba8d2add3f0b6fa20382255f88c53c349e5d6585af61549458d0a74372d2ddf'

    expect(generateSafeTxHash(safe, typedData)).toEqual(safeTxHash)
  })

  it('returns undefined if the safe version is not valid', () => {
    expect(generateSafeTxHash({ ...safe, version: '1.0.0' }, typedData)).toBeUndefined()
  })

  it('logs an error if the safeTxHash cannot be generated', () => {
    const logErrorSpy = jest.spyOn(logErrorModule, 'logError')
    jest.spyOn(utils, '_TypedDataEncoder').mockImplementation({
      encode: () => {
        throw new Error()
      },
      // @ts-expect-error
    } as ReturnType<typeof utils['_TypedDataEncoder']>)

    generateSafeTxHash(safe, typedData)

    expect(logErrorSpy).toHaveBeenCalledWith(ErrorCodes._809, expect.any(String))
    expect(generateSafeTxHash(safe, typedData)).toBeUndefined()
  })
})
