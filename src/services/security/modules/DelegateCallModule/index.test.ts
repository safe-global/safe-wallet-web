import { OperationType } from '@safe-global/safe-core-sdk-types'
import { getMultiSendCallOnlyDeployment } from '@safe-global/safe-deployments'
import { hexZeroPad } from 'ethers/lib/utils'

import { DelegateCallModule } from '.'
import { createMockSafeTransaction, getMockMultiSendCalldata } from '@/tests/transactions'

describe('DelegateCallModule', () => {
  const DelegateCallModuleInstance = new DelegateCallModule()

  it('should not warn about Call operation transactions', async () => {
    const recipient = hexZeroPad('0x1', 20)

    const safeTransaction = createMockSafeTransaction({
      to: recipient,
      data: '0x',
      operation: OperationType.Call,
    })

    const result = await DelegateCallModuleInstance.scanTransaction({
      safeTransaction,
      chainId: '5',
      safeVersion: '1.3.0',
    })

    expect(result).toEqual({
      severity: 0,
    })
  })

  it('should not warn about MultiSendCallOnly DelegateCall operation transactions', async () => {
    const CHAIN_ID = '5'
    const SAFE_VERSION = '1.3.0'

    const multiSend = getMultiSendCallOnlyDeployment({
      network: CHAIN_ID,
      version: SAFE_VERSION,
    })!.defaultAddress

    const recipient1 = hexZeroPad('0x2', 20)
    const recipient2 = hexZeroPad('0x3', 20)

    const data = getMockMultiSendCalldata([recipient1, recipient2])

    const safeTransaction = createMockSafeTransaction({
      to: multiSend,
      data,
      operation: OperationType.DelegateCall,
    })

    const result = await DelegateCallModuleInstance.scanTransaction({
      safeTransaction,
      chainId: CHAIN_ID,
      safeVersion: SAFE_VERSION,
    })

    expect(result).toEqual({
      severity: 0,
    })
  })

  it('should warn about non-MultiSendCallOnly DelegateCall operation transactions', async () => {
    const recipient = hexZeroPad('0x1', 20)

    const safeTransaction = createMockSafeTransaction({
      to: recipient,
      data: '0x',
      operation: OperationType.DelegateCall,
    })

    const result = await DelegateCallModuleInstance.scanTransaction({
      safeTransaction,
      chainId: '5',
      safeVersion: '1.3.0',
    })

    expect(result).toEqual({
      severity: 3,
      payload: {
        description: {
          long: 'This transaction is a DelegateCall. It calls a smart contract that will be able to modify your Safe Account.',
          short: 'Unexpected DelegateCall',
        },
      },
    })
  })
})
