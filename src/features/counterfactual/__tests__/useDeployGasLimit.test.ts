import useDeployGasLimit from '@/features/counterfactual/hooks/useDeployGasLimit'
import * as onboard from '@/hooks/wallets/useOnboard'
import * as sdk from '@/services/tx/tx-sender/sdk'
import { safeTxBuilder } from '@/tests/builders/safeTx'
import * as protocolKit from '@safe-global/protocol-kit'
import { renderHook } from '@/tests/test-utils'
import { waitFor } from '@testing-library/react'
import type { OnboardAPI } from '@web3-onboard/core'

describe('useDeployGasLimit hook', () => {
  it('returns undefined in onboard is not initialized', () => {
    jest.spyOn(onboard, 'default').mockReturnValue(undefined)
    const { result } = renderHook(() => useDeployGasLimit())

    expect(result.current.gasLimit).toBeUndefined()
  })

  it('returns safe deployment gas estimation', async () => {
    const mockGas = '100'
    jest.spyOn(onboard, 'default').mockImplementation(jest.fn(() => ({} as OnboardAPI)))
    jest.spyOn(sdk, 'getSafeSDKWithSigner').mockImplementation(jest.fn())
    const mockEstimateSafeDeploymentGas = jest
      .spyOn(protocolKit, 'estimateSafeDeploymentGas')
      .mockReturnValue(Promise.resolve(mockGas))

    const { result } = renderHook(() => useDeployGasLimit())

    await waitFor(() => {
      expect(mockEstimateSafeDeploymentGas).toHaveBeenCalled()
      expect(result.current.gasLimit?.safeDeploymentGas).toEqual(mockGas)
    })
  })

  it('does not estimate baseGas and safeTxGas if there is no safeTx and returns 0 for them instead', async () => {
    jest.spyOn(onboard, 'default').mockImplementation(jest.fn(() => ({} as OnboardAPI)))
    jest.spyOn(sdk, 'getSafeSDKWithSigner').mockImplementation(jest.fn())
    jest.spyOn(protocolKit, 'estimateSafeDeploymentGas').mockReturnValue(Promise.resolve('100'))

    const mockEstimateTxBaseGas = jest.spyOn(protocolKit, 'estimateTxBaseGas')
    const mockEstimateSafeTxGas = jest.spyOn(protocolKit, 'estimateSafeTxGas')

    const { result } = renderHook(() => useDeployGasLimit())

    await waitFor(() => {
      expect(mockEstimateTxBaseGas).not.toHaveBeenCalled()
      expect(mockEstimateSafeTxGas).not.toHaveBeenCalled()
      expect(result.current.gasLimit?.baseGas).toEqual('0')
      expect(result.current.gasLimit?.safeTxGas).toEqual('0')
    })
  })

  it('returns the totalFee', async () => {
    jest.spyOn(onboard, 'default').mockImplementation(jest.fn(() => ({} as OnboardAPI)))
    jest.spyOn(sdk, 'getSafeSDKWithSigner').mockImplementation(jest.fn())
    jest.spyOn(protocolKit, 'estimateSafeDeploymentGas').mockReturnValue(Promise.resolve('100'))
    jest.spyOn(protocolKit, 'estimateTxBaseGas').mockReturnValue(Promise.resolve('100'))
    jest.spyOn(protocolKit, 'estimateSafeTxGas').mockReturnValue(Promise.resolve('100'))

    const { result } = renderHook(() => useDeployGasLimit(safeTxBuilder().build()))

    await waitFor(() => {
      expect(result.current.gasLimit?.totalGas).toEqual(300n)
    })
  })
})
