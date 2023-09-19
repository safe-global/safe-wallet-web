import { renderHook, waitFor } from '@testing-library/react'
import { Metadata } from '@tkey-mpc/core'
import fixtures from './fixtures.json'

import BN from 'bn.js'
import { getPubKeyPoint, ShareStore } from '@tkey-mpc/common-types'
import { usePasswordRecovery } from '../usePasswordRecovery'
import { MockThresholdKey, type TKeySetupParameters } from './mockTKey'

const localShareSetupParams: TKeySetupParameters = {
  metadata: Metadata.fromJSON(fixtures.fixtureInitializedLocalShare.metadata),
  share1: ShareStore.fromJSON(fixtures.fixtureInitializedLocalShare.shares[1]),
  share2: ShareStore.fromJSON(fixtures.fixtureInitializedLocalShare.shares[2]),
  privateKey: fixtures.fixtureInitializedLocalShare.privateKey,
}

jest.mock('@/hooks/wallets/mpc/useMPC', () => ({
  __esModule: true,
  default: jest.fn(() => MockThresholdKey.getInstance()),
}))

describe('usePasswordRecovery', () => {
  it('should setup password recovery and recover the factorKey correctly', async () => {
    MockThresholdKey.resetInstance()
    const tKey = MockThresholdKey.createInstance(localShareSetupParams)
    await waitFor(() => {
      expect(tKey.isInitialized()).toBeTruthy()
    })

    const TEST_PASSWORD = 'deadbeef'
    const localFactorKey = new BN(fixtures.fixtureInitializedLocalShare.localFactorKey, 'hex')

    const { result } = renderHook(() => usePasswordRecovery(localFactorKey))
    await result.current.upsertPasswordBackup(TEST_PASSWORD)

    const question = 'ENTER PASSWORD'
    const questionEntryString = tKey.metadata.getShareDescription()[question]
    expect(questionEntryString).toBeDefined()
    expect(questionEntryString).toHaveLength(1)
    const questionEntry = JSON.parse(questionEntryString[0])

    expect(questionEntry.module).toBe('securityQuestions')
    expect(questionEntry.associatedFactor).toBeDefined()

    // Try to decrypt it with the password Hash and check that the public key is in the share store
    const recoveredFactorKey = await result.current.recoverPasswordFactorKey(TEST_PASSWORD)

    const restoredPubKey = getPubKeyPoint(recoveredFactorKey)
    const shareDescriptions = tKey.metadata.getShareDescription()

    const x = restoredPubKey.x.toString('hex', 64)
    const y = restoredPubKey.y.toString('hex', 64)
    expect(shareDescriptions[`04${x}${y}`]).toBeDefined()
  })

  it('should throw if recovering without a password recovery setup', async () => {
    MockThresholdKey.resetInstance()
    const tKey = MockThresholdKey.createInstance(localShareSetupParams)
    await waitFor(() => {
      expect(tKey.isInitialized()).toBeTruthy()
    })

    const localFactorKey = new BN(fixtures.fixtureInitializedLocalShare.localFactorKey, 'hex')

    const { result } = renderHook(() => usePasswordRecovery(localFactorKey))

    // Try to decrypt it with the password Hash and check that the public key is in the share store
    expect(result.current.recoverPasswordFactorKey('Some password')).rejects.toEqual(
      new Error('No password backup found'),
    )
  })

  it('Should not be able to recover using an invalid password', async () => {
    MockThresholdKey.resetInstance()
    const tKey = MockThresholdKey.createInstance(localShareSetupParams)
    await waitFor(() => {
      expect(tKey.isInitialized()).toBeTruthy()
    })

    const TEST_PASSWORD = 'deadbeef'
    const localFactorKey = new BN(fixtures.fixtureInitializedLocalShare.localFactorKey, 'hex')

    const { result } = renderHook(() => usePasswordRecovery(localFactorKey))
    await result.current.upsertPasswordBackup(TEST_PASSWORD)

    const question = 'ENTER PASSWORD'
    const questionEntryString = tKey.metadata.getShareDescription()[question]
    expect(questionEntryString).toBeDefined()
    expect(questionEntryString).toHaveLength(1)
    const questionEntry = JSON.parse(questionEntryString[0])

    expect(questionEntry.module).toBe('securityQuestions')
    expect(questionEntry.associatedFactor).toBeDefined()

    expect(result.current.recoverPasswordFactorKey('Wrong password')).rejects.toEqual(
      new Error('Unable to decrypt using the entered password.'),
    )
  })
})
