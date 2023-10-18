import * as analytics from '@/services/analytics'
import * as useWallet from '@/hooks/wallets/useWallet'
import { WALLET_EVENTS } from '@/services/analytics'
import { txDispatch, TxEvent } from '@/services/tx/txEvents'
import { renderHook } from '@/tests/test-utils'
import { useTxTracking } from '../useTxTracking'
import { hexZeroPad } from 'ethers/lib/utils'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/module'
import { type EIP1193Provider } from '@web3-onboard/core'

describe('useTxTracking', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should track relayed executions', () => {
    const trackEventSpy = jest.spyOn(analytics, 'trackEvent')
    renderHook(() => useTxTracking())

    txDispatch(TxEvent.RELAYING, {
      taskId: '0x123',
      groupKey: '0x234',
    })
    expect(trackEventSpy).toBeCalledWith({ ...WALLET_EVENTS.RELAYED_EXECUTION, label: undefined })
  })

  it('should track tx signing', () => {
    const trackEventSpy = jest.spyOn(analytics, 'trackEvent')
    renderHook(() => useTxTracking())

    txDispatch(TxEvent.SIGNED, {
      txId: '0x123',
    })
    expect(trackEventSpy).toBeCalledWith({ ...WALLET_EVENTS.OFF_CHAIN_SIGNATURE, label: undefined })
  })

  it('should track tx execution', () => {
    const trackEventSpy = jest.spyOn(analytics, 'trackEvent')
    renderHook(() => useTxTracking())

    txDispatch(TxEvent.PROCESSING, {
      txId: '0x123',
      txHash: '0x234',
    })
    expect(trackEventSpy).toBeCalledWith({ ...WALLET_EVENTS.ON_CHAIN_INTERACTION, label: undefined })
  })

  it('should track currently connected wallet label', () => {
    const trackEventSpy = jest.spyOn(analytics, 'trackEvent')
    const mockWallet = {
      address: hexZeroPad('0x1', 20),
      chainId: '100',
      label: ONBOARD_MPC_MODULE_LABEL,
      provider: {} as unknown as EIP1193Provider,
    }
    const useWalletSpy = jest.spyOn(useWallet, 'default').mockReturnValue(mockWallet)
    const { rerender } = renderHook(() => useTxTracking())

    txDispatch(TxEvent.PROCESSING, {
      txId: '0x123',
      txHash: '0x234',
    })
    expect(trackEventSpy).toBeCalledWith({ ...WALLET_EVENTS.ON_CHAIN_INTERACTION, label: ONBOARD_MPC_MODULE_LABEL })

    useWalletSpy.mockReturnValue({ ...mockWallet, label: 'MetaMask' })
    rerender()

    txDispatch(TxEvent.RELAYING, {
      taskId: '0x123',
      groupKey: '0x123',
    })

    expect(trackEventSpy).toBeCalledWith({ ...WALLET_EVENTS.RELAYED_EXECUTION, label: 'MetaMask' })
  })
})
