import { createNewSpendingLimitTx } from '@/services/tx/spendingLimitParams'
import { NewSpendingLimitData } from '@/components/settings/SpendingLimits/NewSpendingLimit'
import { ZERO_ADDRESS } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'
import * as safeCoreSDK from '@/hooks/coreSDK/safeCoreSDK'

const mockData: NewSpendingLimitData = {
  beneficiary: ZERO_ADDRESS,
  tokenAddress: '0x1',
  amount: '1',
  resetTime: '0',
}

describe('createNewSpendingLimitTx', () => {
  it('returns undefined if there is no contract address', async () => {
    jest.spyOn(safeCoreSDK, 'getSafeSDK').mockReturnValue(undefined)
    const result = await createNewSpendingLimitTx(mockData, [], '4', 18, undefined)

    expect(result).toBeUndefined()
  })

  it.todo('returns undefined if there is no sdk instance')
  it.todo('creates a tx to enable the spending limit module if its not registered yet')
  it.todo('creates a tx to add a delegate if beneficiary is not a delegate yet')
  it.todo('creates a tx to reset an existing allowance if some of the allowance was already spent')
  it.todo('creates a tx to set the allowance')
  it.todo('encodes all txs as a single multiSend tx')
})
