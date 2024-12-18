import { faker } from '@faker-js/faker'
import { relayTransaction as _relayTransaction } from '@safe-global/safe-gateway-typescript-sdk'

import { relayTransaction } from '@/services/tx/relaying'
import { getWeb3ReadOnly } from '@/hooks/wallets/web3'

jest.mock('@/hooks/wallets/web3')
jest.mock('@safe-global/safe-gateway-typescript-sdk')

describe('relayTransaction', () => {
  let chainId: string
  let body: {
    version: string
    to: string
    data: string
    gasLimit: string | undefined
  }

  beforeEach(() => {
    jest.clearAllMocks()

    chainId = faker.string.numeric()
    body = {
      version: faker.system.semver(),
      to: faker.finance.ethereumAddress(),
      data: faker.string.hexadecimal(),
      gasLimit: undefined,
    }
  })

  it('should relay with the correct parameters when gasLimit is provided', async () => {
    const bodyWithGasLimit = {
      ...body,
      gasLimit: faker.string.numeric(),
    }

    await relayTransaction(chainId, bodyWithGasLimit)

    expect(_relayTransaction).toHaveBeenCalledWith(chainId, bodyWithGasLimit)
  })

  it('should estimate gasLimit if not provided and relay with the estimated gasLimit', async () => {
    const gasLimit = faker.number.bigInt()
    const mockProvider = {
      estimateGas: jest.fn().mockResolvedValue(gasLimit),
    }
    ;(getWeb3ReadOnly as jest.Mock).mockReturnValue(mockProvider)

    await relayTransaction(chainId, body)

    expect(mockProvider.estimateGas).toHaveBeenCalledWith(body)
    expect(_relayTransaction).toHaveBeenCalledWith(chainId, { ...body, gasLimit: gasLimit.toString() })
  })

  it('should relay with undefined gasLimit if estimation fails', async () => {
    const mockProvider = {
      estimateGas: jest.fn().mockRejectedValue(new Error('Estimation failed')),
    }
    ;(getWeb3ReadOnly as jest.Mock).mockReturnValue(mockProvider)

    await relayTransaction(chainId, body)

    expect(mockProvider.estimateGas).toHaveBeenCalledWith(body)
    expect(_relayTransaction).toHaveBeenCalledWith(chainId, { ...body, gasLimit: undefined })
  })
})
