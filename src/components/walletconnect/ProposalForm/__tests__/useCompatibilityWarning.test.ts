import { renderHook } from '@/tests/test-utils'
import type { ChainInfo, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { Web3WalletTypes } from '@walletconnect/web3wallet'

import * as bridges from '../bridges'
import { useCompatibilityWarning } from '../useCompatibilityWarning'

describe('useCompatibilityWarning', () => {
  it('should return an error for a dangerous bridge', () => {
    jest.spyOn(bridges, 'isStrictAddressBridge').mockReturnValue(true)

    const proposal = {
      params: { proposer: { metadata: { name: 'Fake Bridge' } } },
      verifyContext: { verified: { origin: '' } },
    } as unknown as Web3WalletTypes.SessionProposal

    const { result } = renderHook(() => useCompatibilityWarning(proposal, false))

    expect(result.current).toEqual({
      message:
        'Fake Bridge is a bridge that is unusable in Safe{Wallet} due to the current implementation of WalletConnect — the bridged funds will be lost. Consider using a different bridge.',
      severity: 'error',
    })
  })

  it('should return a warning for a risky bridge', () => {
    jest.spyOn(bridges, 'isStrictAddressBridge').mockReturnValue(false)
    jest.spyOn(bridges, 'isDefaultAddressBridge').mockReturnValue(true)

    const proposal = {
      params: { proposer: { metadata: { name: 'Fake Bridge' } } },
      verifyContext: { verified: { origin: '' } },
    } as unknown as Web3WalletTypes.SessionProposal

    const { result } = renderHook(() => useCompatibilityWarning(proposal, false))

    expect(result.current).toEqual({
      message:
        'While using Fake Bridge, please make sure that the desination address you send funds to matches the Safe address you have on the respective chain. Otherwise, the funds will be lost.',
      severity: 'warning',
    })
  })

  it('should return an error for an unsupported chain', () => {
    jest.spyOn(bridges, 'isStrictAddressBridge').mockReturnValue(false)
    jest.spyOn(bridges, 'isDefaultAddressBridge').mockReturnValue(false)

    const proposal = {
      params: { proposer: { metadata: { name: 'Fake dApp' } } },
      verifyContext: { verified: { origin: '' } },
    } as unknown as Web3WalletTypes.SessionProposal

    const { result } = renderHook(() => useCompatibilityWarning(proposal, true))

    expect(result.current).toEqual({
      message:
        'Fake dApp does not support the Safe Account network. If you want to interact with Fake dApp, please switch to a Safe Account on a supported network.',
      severity: 'error',
    })
  })

  describe('should otherwise return info', () => {
    it('if chains are loaded', () => {
      jest.spyOn(bridges, 'isStrictAddressBridge').mockReturnValue(false)
      jest.spyOn(bridges, 'isDefaultAddressBridge').mockReturnValue(false)

      const proposal = {
        params: { proposer: { metadata: { name: 'Fake dApp' } } },
        verifyContext: { verified: { origin: '' } },
      } as unknown as Web3WalletTypes.SessionProposal

      const { result } = renderHook(() => useCompatibilityWarning(proposal, false), {
        initialReduxState: {
          chains: {
            loading: false,
            error: undefined,
            data: [
              {
                chainId: '1',
                chainName: 'Ethereum',
              },
            ] as unknown as Array<ChainInfo>,
          },
          safeInfo: {
            loading: false,
            error: undefined,
            data: {
              address: {},
              chainId: '1',
            } as unknown as SafeInfo,
          },
        },
      })

      expect(result.current).toEqual({
        message: 'Please make sure that the dApp is connected to Ethereum.',
        severity: 'info',
      })
    })

    it("if chains aren't loaded", () => {
      jest.spyOn(bridges, 'isStrictAddressBridge').mockReturnValue(false)
      jest.spyOn(bridges, 'isDefaultAddressBridge').mockReturnValue(false)

      const proposal = {
        params: { proposer: { metadata: { name: 'Fake dApp' } } },
        verifyContext: { verified: { origin: '' } },
      } as unknown as Web3WalletTypes.SessionProposal

      const { result } = renderHook(() => useCompatibilityWarning(proposal, false))

      expect(result.current).toEqual({
        message: 'Please make sure that the dApp is connected to this network.',
        severity: 'info',
      })
    })
  })
})
