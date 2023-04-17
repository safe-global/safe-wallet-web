import { JsonRpcProvider, type TransactionResponse, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { EMPTY_DATA, ZERO_ADDRESS } from '@safe-global/safe-core-sdk/dist/src/utils/constants'
import * as web3 from '@/hooks/wallets/web3'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'
import {
  checkSafeCreationTx,
  relaySafeCreation,
  handleSafeCreationError,
} from '@/components/new-safe/create/logic/index'
import { ErrorCode } from '@ethersproject/logger'
import { EthersTxReplacedReason } from '@/utils/ethers-utils'
import { SafeCreationStatus } from '@/components/new-safe/create/steps/StatusStep/useSafeCreation'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { hexZeroPad } from 'ethers/lib/utils'
import * as sponsoredCall from '@/services/tx/sponsoredCall'
import {
  Gnosis_safe__factory,
  Proxy_factory__factory,
} from '@/types/contracts/factories/@safe-global/safe-deployments/dist/assets/v1.3.0'
import {
  getReadOnlyFallbackHandlerContract,
  getReadOnlyGnosisSafeContract,
  getReadOnlyProxyFactoryContract,
} from '@/services/contracts/safeContracts'

const provider = new JsonRpcProvider(undefined, { name: 'rinkeby', chainId: 4 })

const mockTransaction = {
  data: EMPTY_DATA,
  nonce: 1,
  from: '0x10',
  to: '0x11',
  value: BigNumber.from(0),
}

const mockPendingTx = {
  data: EMPTY_DATA,
  from: ZERO_ADDRESS,
  to: ZERO_ADDRESS,
  nonce: 0,
  startBlock: 0,
  value: BigNumber.from(0),
}

describe('checkSafeCreationTx', () => {
  let waitForTxSpy = jest.spyOn(provider, '_waitForTransaction')

  beforeEach(() => {
    jest.resetAllMocks()

    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(() => new Web3Provider(jest.fn()))

    waitForTxSpy = jest.spyOn(provider, '_waitForTransaction')
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
      code: ErrorCode.TIMEOUT,
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
      code: ErrorCode.ACTION_REJECTED,
      reason: '' as EthersTxReplacedReason,
      receipt: {} as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.WALLET_REJECTED)
  })

  it('returns WALLET_REJECTED if the tx was rejected via WC', () => {
    const mockEthersError = {
      ...new Error(),
      code: ErrorCode.UNKNOWN_ERROR,
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
      code: ErrorCode.TRANSACTION_REPLACED,
      reason: EthersTxReplacedReason.cancelled,
      receipt: {} as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.ERROR)
  })

  it('returns SUCCESS if the tx was replaced', () => {
    const mockEthersError = {
      ...new Error(),
      code: ErrorCode.TRANSACTION_REPLACED,
      reason: EthersTxReplacedReason.replaced,
      receipt: {} as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.SUCCESS)
  })

  it('returns SUCCESS if the tx was repriced', () => {
    const mockEthersError = {
      ...new Error(),
      code: ErrorCode.TRANSACTION_REPLACED,
      reason: EthersTxReplacedReason.repriced,
      receipt: {} as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.SUCCESS)
  })

  it('returns ERROR if the tx was not rejected, cancelled or replaced', () => {
    const mockEthersError = {
      ...new Error(),
      code: ErrorCode.UNKNOWN_ERROR,
      reason: '' as EthersTxReplacedReason,
      receipt: {} as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.ERROR)
  })

  it('returns REVERTED if the tx failed', () => {
    const mockEthersError = {
      ...new Error(),
      code: ErrorCode.UNKNOWN_ERROR,
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
  const owner1 = hexZeroPad('0x1', 20)
  const owner2 = hexZeroPad('0x2', 20)

  const mockChainInfo = {
    chainId: '5',
    l2: false,
  } as ChainInfo

  it('returns taskId if create Safe successfully relayed', async () => {
    const sponsoredCallSpy = jest.spyOn(sponsoredCall, 'sponsoredCall').mockResolvedValue({ taskId: '0x123' })

    const expectedSaltNonce = 69
    const expectedThreshold = 1
    const proxyFactoryAddress = getReadOnlyProxyFactoryContract('5').getAddress()
    const readOnlyFallbackHandlerContract = getReadOnlyFallbackHandlerContract('5')
    const safeContractAddress = getReadOnlyGnosisSafeContract(mockChainInfo).getAddress()

    const expectedInitializer = Gnosis_safe__factory.createInterface().encodeFunctionData('setup', [
      [owner1, owner2],
      expectedThreshold,
      ZERO_ADDRESS,
      EMPTY_DATA,
      readOnlyFallbackHandlerContract.getAddress(),
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
    expect(sponsoredCallSpy).toHaveBeenCalledTimes(1)
    expect(sponsoredCallSpy).toHaveBeenCalledWith({
      chainId: '5',
      to: proxyFactoryAddress,
      data: expectedCallData,
    })
  })

  it('should throw an error if relaying fails', () => {
    const relayFailedError = new Error('Relay failed')

    jest.spyOn(sponsoredCall, 'sponsoredCall').mockRejectedValue(relayFailedError)

    expect(relaySafeCreation(mockChainInfo, [owner1, owner2], 1, 69)).rejects.toEqual(relayFailedError)
  })
})
