import { isSpeedableTx } from '../IsSpeedableTx'
import { PendingStatus, type PendingTx, PendingTxType } from '@/store/pendingTxsSlice'
import { faker } from '@faker-js/faker'

describe('isSpeedableTx', () => {
  it('returns true when all conditions are met', () => {
    const pendingTx: PendingTx = {
      status: PendingStatus.PROCESSING,
      txHash: '0x123',
      signerAddress: '0xabc',
      chainId: '1',
      safeAddress: '0xdef',
      txType: PendingTxType.SAFE_TX,
      signerNonce: 0,
      submittedAt: Date.now(),
      gasLimit: 45_000,
    }

    const isSmartContract = false
    const walletAddress = '0xabc'

    const result = isSpeedableTx(pendingTx, isSmartContract, walletAddress)

    expect(result).toBe(true)
  })

  it('returns false when one of the conditions is not met', () => {
    const pendingTx: PendingTx = {
      status: PendingStatus.PROCESSING,
      txHash: '0x123',
      signerAddress: '0xabc',
      chainId: '1',
      safeAddress: '0xdef',
      txType: PendingTxType.CUSTOM_TX,
      signerNonce: 0,
      submittedAt: Date.now(),
      data: '0x1234',
      to: faker.finance.ethereumAddress(),
    }

    const isSmartContract = true
    const walletAddress = '0xabc'

    const result = isSpeedableTx(pendingTx, isSmartContract, walletAddress)

    expect(result).toBe(false)
  })
})
