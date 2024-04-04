import { JsonRpcProvider, type TransactionResponse } from 'ethers'
import { EMPTY_DATA, ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import * as web3 from '@/hooks/wallets/web3'
import type { TransactionReceipt } from 'ethers'
import {
  checkSafeCreationTx,
  relaySafeCreation,
  handleSafeCreationError,
} from '@/components/new-safe/create/logic/index'
import { type ErrorCode } from 'ethers'
import { EthersTxReplacedReason } from '@/utils/ethers-utils'
import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import { relayTransaction, type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { toBeHex } from 'ethers'
import {
  Gnosis_safe__factory,
  Proxy_factory__factory,
} from '@/types/contracts/factories/@safe-global/safe-deployments/dist/assets/v1.3.0'
import {
  getReadOnlyFallbackHandlerContract,
  getReadOnlyGnosisSafeContract,
  getReadOnlyProxyFactoryContract,
} from '@/services/contracts/safeContracts'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import * as gateway from '@safe-global/safe-gateway-typescript-sdk'

const provider = new JsonRpcProvider(undefined, { name: 'rinkeby', chainId: 4 })

const mockTransaction = {
  data: EMPTY_DATA,
  nonce: 1,
  from: '0x10',
  to: '0x11',
  value: BigInt(0),
}

const mockPendingTx = {
  data: EMPTY_DATA,
  from: ZERO_ADDRESS,
  to: ZERO_ADDRESS,
  nonce: 0,
  startBlock: 0,
  value: BigInt(0),
}

jest.mock('@safe-global/protocol-kit', () => {
  const originalModule = jest.requireActual('@safe-global/protocol-kit')

  // Mock class
  class MockEthersAdapter extends originalModule.EthersAdapter {
    getChainId = jest.fn().mockImplementation(() => Promise.resolve(BigInt(4)))
  }

  return {
    ...originalModule,
    EthersAdapter: MockEthersAdapter,
  }
})

describe('checkSafeCreationTx', () => {
  let waitForTxSpy = jest.spyOn(provider, 'waitForTransaction')

  beforeEach(() => {
    jest.resetAllMocks()

    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(() => provider)

    waitForTxSpy = jest.spyOn(provider, 'waitForTransaction')
    jest.spyOn(provider, 'getBlockNumber').mockReturnValue(Promise.resolve(4))
    jest.spyOn(provider, 'getTransaction').mockReturnValue(Promise.resolve(mockTransaction as TransactionResponse))
  })

  it('returns SUCCESS if promise was resolved', async () => {
    const receipt = {
      status: 1,
    } as TransactionReceipt

    waitForTxSpy.mockImplementationOnce(() => Promise.resolve(receipt))

    const result = await checkSafeCreationTx(provider, mockPendingTx, '0x0', jest.fn())

    expect(result).toBe(SafeCreationStatus.SUCCESS)
  })

  it('returns REVERTED if transaction was reverted', async () => {
    const receipt = {
      status: 0,
    } as TransactionReceipt

    waitForTxSpy.mockImplementationOnce(() => Promise.resolve(receipt))

    const result = await checkSafeCreationTx(provider, mockPendingTx, '0x0', jest.fn())

    expect(result).toBe(SafeCreationStatus.REVERTED)
  })

  it('returns TIMEOUT if transaction could not be found within the timeout limit', async () => {
    const mockEthersError = {
      ...new Error(),
      code: 'TIMEOUT' as ErrorCode,
    }

    waitForTxSpy.mockImplementationOnce(() => Promise.reject(mockEthersError))

    const result = await checkSafeCreationTx(provider, mockPendingTx, '0x0', jest.fn())

    expect(result).toBe(SafeCreationStatus.TIMEOUT)
  })

  it('returns SUCCESS if transaction was replaced', async () => {
    const mockEthersError = {
      ...new Error(),
      code: 'TRANSACTION_REPLACED',
      reason: 'repriced',
    }
    waitForTxSpy.mockImplementationOnce(() => Promise.reject(mockEthersError))

    const result = await checkSafeCreationTx(provider, mockPendingTx, '0x0', jest.fn())

    expect(result).toBe(SafeCreationStatus.SUCCESS)
  })

  it('returns ERROR if transaction was cancelled', async () => {
    const mockEthersError = {
      ...new Error(),
      code: 'TRANSACTION_REPLACED',
      reason: 'cancelled',
    }
    waitForTxSpy.mockImplementationOnce(() => Promise.reject(mockEthersError))

    const result = await checkSafeCreationTx(provider, mockPendingTx, '0x0', jest.fn())

    expect(result).toBe(SafeCreationStatus.ERROR)
  })
})

describe('handleSafeCreationError', () => {
  it('returns WALLET_REJECTED if the tx was rejected in the wallet', () => {
    const mockEthersError = {
      ...new Error(),
      code: 'ACTION_REJECTED' as ErrorCode,
      reason: '' as EthersTxReplacedReason,
      receipt: {} as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.WALLET_REJECTED)
  })

  it('returns WALLET_REJECTED if the tx was rejected via WC', () => {
    const mockEthersError = {
      ...new Error(),
      code: 'UNKNOWN_ERROR' as ErrorCode,
      reason: '' as EthersTxReplacedReason,
      receipt: {} as TransactionReceipt,
      message: 'rejected',
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.WALLET_REJECTED)
  })

  it('returns ERROR if the tx was cancelled', () => {
    const mockEthersError = {
      ...new Error(),
      code: 'TRANSACTION_REPLACED' as ErrorCode,
      reason: EthersTxReplacedReason.cancelled,
      receipt: {} as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.ERROR)
  })

  it('returns SUCCESS if the tx was replaced', () => {
    const mockEthersError = {
      ...new Error(),
      code: 'TRANSACTION_REPLACED' as ErrorCode,
      reason: EthersTxReplacedReason.replaced,
      receipt: {} as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.SUCCESS)
  })

  it('returns SUCCESS if the tx was repriced', () => {
    const mockEthersError = {
      ...new Error(),
      code: 'TRANSACTION_REPLACED' as ErrorCode,
      reason: EthersTxReplacedReason.repriced,
      receipt: {} as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.SUCCESS)
  })

  it('returns ERROR if the tx was not rejected, cancelled or replaced', () => {
    const mockEthersError = {
      ...new Error(),
      code: 'UNKNOWN_ERROR' as ErrorCode,
      reason: '' as EthersTxReplacedReason,
      receipt: {} as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.ERROR)
  })

  it('returns REVERTED if the tx failed', () => {
    const mockEthersError = {
      ...new Error(),
      code: 'UNKNOWN_ERROR' as ErrorCode,
      reason: '' as EthersTxReplacedReason,
      receipt: {
        status: 0,
      } as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.REVERTED)
  })
})

describe('createNewSafeViaRelayer', () => {
  const owner1 = toBeHex('0x1', 20)
  const owner2 = toBeHex('0x2', 20)

  const mockChainInfo = {
    chainId: '5',
    l2: false,
  } as ChainInfo

  beforeAll(() => {
    jest.resetAllMocks()
    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(() => provider)
  })

  it('returns taskId if create Safe successfully relayed', async () => {
    jest.spyOn(gateway, 'relayTransaction').mockResolvedValue({ taskId: '0x123' })

    const expectedSaltNonce = 69
    const expectedThreshold = 1
    const proxyFactoryAddress = await (await getReadOnlyProxyFactoryContract('5', LATEST_SAFE_VERSION)).getAddress()
    const readOnlyFallbackHandlerContract = await getReadOnlyFallbackHandlerContract('5', LATEST_SAFE_VERSION)
    const safeContractAddress = await (await getReadOnlyGnosisSafeContract(mockChainInfo)).getAddress()

    const expectedInitializer = Gnosis_safe__factory.createInterface().encodeFunctionData('setup', [
      [owner1, owner2],
      expectedThreshold,
      ZERO_ADDRESS,
      EMPTY_DATA,
      await readOnlyFallbackHandlerContract.getAddress(),
      ZERO_ADDRESS,
      0,
      ZERO_ADDRESS,
    ])

    const expectedCallData = Proxy_factory__factory.createInterface().encodeFunctionData('createProxyWithNonce', [
      safeContractAddress,
      expectedInitializer,
      expectedSaltNonce,
    ])

    const taskId = await relaySafeCreation(mockChainInfo, [owner1, owner2], expectedThreshold, expectedSaltNonce)

    expect(taskId).toEqual('0x123')
    expect(relayTransaction).toHaveBeenCalledTimes(1)
    expect(relayTransaction).toHaveBeenCalledWith('5', {
      to: proxyFactoryAddress,
      data: expectedCallData,
      version: LATEST_SAFE_VERSION,
    })
  })

  it('should throw an error if relaying fails', () => {
    const relayFailedError = new Error('Relay failed')
    jest.spyOn(gateway, 'relayTransaction').mockRejectedValue(relayFailedError)

    expect(relaySafeCreation(mockChainInfo, [owner1, owner2], 1, 69)).rejects.toEqual(relayFailedError)
  })
})
