import { JsonRpcProvider, type TransactionResponse, Web3Provider } from '@ethersproject/providers'
import { BigNumber } from '@ethersproject/bignumber'
import { EMPTY_DATA, ZERO_ADDRESS } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import * as web3 from '@/hooks/wallets/web3'
import type { TransactionReceipt } from '@ethersproject/abstract-provider'
import { checkSafeCreationTx, handleSafeCreationError } from '@/components/create-safe/logic'
import { SafeCreationStatus } from '@/components/create-safe/status/useSafeCreation'
import { ErrorCode } from '@ethersproject/logger'
import { EthersTxReplacedReason } from '@/utils/ethers-utils'

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

    jest.spyOn(web3, 'getWeb3').mockImplementation(() => new Web3Provider(jest.fn()))

    waitForTxSpy = jest.spyOn(provider, '_waitForTransaction')
    jest.spyOn(provider, 'getBlockNumber').mockReturnValue(Promise.resolve(4))
    jest.spyOn(provider, 'getTransaction').mockReturnValue(Promise.resolve(mockTransaction as TransactionResponse))
  })

  it('returns SUCCESS if promise was resolved', async () => {
    const receipt = {
      status: 1,
    } as TransactionReceipt

    waitForTxSpy.mockImplementationOnce(() => Promise.resolve(receipt))

    const result = await checkSafeCreationTx(provider, mockPendingTx, '0x0')

    expect(result).toBe(SafeCreationStatus.SUCCESS)
  })

  it('returns REVERTED if transaction was reverted', async () => {
    const receipt = {
      status: 0,
    } as TransactionReceipt

    waitForTxSpy.mockImplementationOnce(() => Promise.resolve(receipt))

    const result = await checkSafeCreationTx(provider, mockPendingTx, '0x0')

    expect(result).toBe(SafeCreationStatus.REVERTED)
  })

  it('returns TIMEOUT if transaction couldnt be found within the timeout limit', async () => {
    const mockEthersError = {
      ...new Error(),
      receipt: {
        status: 1,
      },
    }

    waitForTxSpy.mockImplementationOnce(() => Promise.reject(mockEthersError))

    const result = await checkSafeCreationTx(provider, mockPendingTx, '0x0')

    expect(result).toBe(SafeCreationStatus.TIMEOUT)
  })

  it('returns SUCCESS if transaction was replaced', async () => {
    const mockEthersError = {
      ...new Error(),
      code: 'TRANSACTION_REPLACED',
      reason: 'repriced',
    }
    waitForTxSpy.mockImplementationOnce(() => Promise.reject(mockEthersError))

    const result = await checkSafeCreationTx(provider, mockPendingTx, '0x0')

    expect(result).toBe(SafeCreationStatus.SUCCESS)
  })

  it('returns ERROR if transaction was cancelled', async () => {
    const mockEthersError = {
      ...new Error(),
      code: 'TRANSACTION_REPLACED',
      reason: 'cancelled',
    }
    waitForTxSpy.mockImplementationOnce(() => Promise.reject(mockEthersError))

    const result = await checkSafeCreationTx(provider, mockPendingTx, '0x0')

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

  it('returns TIMEOUT if the tx was not rejected, cancelled or replaced', () => {
    const mockEthersError = {
      ...new Error(),
      code: ErrorCode.UNKNOWN_ERROR,
      reason: '' as EthersTxReplacedReason,
      receipt: {} as TransactionReceipt,
    }

    const result = handleSafeCreationError(mockEthersError)

    expect(result).toEqual(SafeCreationStatus.TIMEOUT)
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
