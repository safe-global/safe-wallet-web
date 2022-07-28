import { createNewSpendingLimitTx } from '@/services/tx/spendingLimitParams'
import { NewSpendingLimitData } from '@/components/settings/SpendingLimits/NewSpendingLimit'
import { ZERO_ADDRESS } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import * as safeCoreSDK from '@/hooks/coreSDK/safeCoreSDK'
import * as spendingLimit from '@/services/contracts/spendingLimitContracts'
import * as txSender from '@/services/tx/txSender'
import Safe from '@gnosis.pm/safe-core-sdk'

const mockData: NewSpendingLimitData = {
  beneficiary: ZERO_ADDRESS,
  tokenAddress: ZERO_ADDRESS,
  amount: '1',
  resetTime: '0',
}

describe('createNewSpendingLimitTx', () => {
  const mockSDK = {
    isModuleEnabled: jest.fn(),
    getEnableModuleTx: jest.fn(),
  } as unknown as Safe

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('returns undefined if there is no sdk instance', async () => {
    jest.spyOn(safeCoreSDK, 'getSafeSDK').mockReturnValue(undefined)
    const result = await createNewSpendingLimitTx(mockData, [], '4', 18, undefined)

    expect(result).toBeUndefined()
  })

  it('returns undefined if there is no contract address', async () => {
    jest.spyOn(safeCoreSDK, 'getSafeSDK').mockReturnValue(mockSDK)
    jest.spyOn(spendingLimit, 'getSpendingLimitModuleAddress').mockReturnValue(undefined)
    const result = await createNewSpendingLimitTx(mockData, [], '4', 18, undefined)

    expect(result).toBeUndefined()
  })

  it('creates a tx to enable the spending limit module if its not registered yet', async () => {
    const mockGetEnableModuleTx = jest.fn(() => ({
      data: {
        data: '0x',
        to: '0x',
      },
    }))

    const mockSDK = {
      isModuleEnabled: jest.fn(() => false),
      getEnableModuleTx: mockGetEnableModuleTx,
    } as unknown as Safe

    jest.spyOn(txSender, 'createMultiSendTx').mockImplementation(jest.fn())
    jest.spyOn(safeCoreSDK, 'getSafeSDK').mockReturnValue(mockSDK)
    jest.spyOn(spendingLimit, 'getSpendingLimitModuleAddress').mockReturnValue(ZERO_ADDRESS)

    await createNewSpendingLimitTx(mockData, [], '4', 18, undefined)

    expect(mockGetEnableModuleTx).toHaveBeenCalledTimes(1)
  })

  it.todo('creates a tx to add a delegate if beneficiary is not a delegate yet')
  it.todo('creates a tx to reset an existing allowance if some of the allowance was already spent')
  it.todo('creates a tx to set the allowance')
  it.todo('encodes all txs as a single multiSend tx')
})
