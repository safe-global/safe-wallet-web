import { chainBuilder } from '@/tests/builders/chains'
import { FEATURES } from '@/utils/chains'
import MpcModule, { ONBOARD_MPC_MODULE_LABEL } from '../SocialLoginModule'
import { type WalletModule } from '@web3-onboard/common'

import * as web3 from '@/hooks/wallets/web3'
import * as useMPC from '@/hooks/wallets/mpc/useMPC'
import { toBeHex } from 'ethers'

const mockChain = chainBuilder()
  // @ts-expect-error - we are using a local FEATURES enum
  .with({ features: [FEATURES.SOCIAL_LOGIN] })
  .build()

describe('MPC Onboard module', () => {
  it('should return correct metadata', async () => {
    const mpcModule = MpcModule(mockChain)({
      device: {
        browser: {
          name: 'Firefox',
          version: '1.0',
        },
        os: {
          name: 'macOS',
          version: '1.0',
        },
        type: 'desktop',
      },
    })
    expect(Array.isArray(mpcModule)).toBeFalsy()
    const walletModule = mpcModule as WalletModule

    expect(walletModule.label).toBe(ONBOARD_MPC_MODULE_LABEL)
    expect(walletModule.getIcon()).toBeDefined()
    const walletInterface = await walletModule.getInterface({} as any)
    expect(walletInterface.instance).toBeUndefined()
    expect(walletInterface.provider).toBeDefined()
  })

  it('should call web3readonly for eth_estimateGas', async () => {
    const mockReadOnlySend = jest.fn().mockImplementation(() => Promise.resolve('0x5'))
    jest.spyOn(web3, 'getWeb3ReadOnly').mockReturnValue({
      send: mockReadOnlySend,
    } as any)

    jest.spyOn(useMPC, '_getMPCCoreKitInstance').mockImplementation(() => {
      return {
        provider: {},
      } as any
    })

    const mpcModule = MpcModule(mockChain)({
      device: {
        browser: {
          name: 'Firefox',
          version: '1.0',
        },
        os: {
          name: 'macOS',
          version: '1.0',
        },
        type: 'desktop',
      },
    })
    const walletModule = mpcModule as WalletModule
    const walletInterface = await walletModule.getInterface({} as any)

    await walletInterface.provider.request({
      method: 'eth_estimateGas',
      params: [
        {
          to: toBeHex('0x123', 20),
          value: '0',
          data: '0x',
        },
      ],
    })

    expect(mockReadOnlySend).toHaveBeenCalledWith('eth_estimateGas', [
      {
        to: toBeHex('0x123', 20),
        value: '0',
        data: '0x',
      },
    ])
  })

  it('should call eth_accounts when eth_requestAccounts gets called', async () => {
    const mockReadOnlySend = jest.fn()
    const mockMPCProviderRequest = jest.fn().mockImplementation(() => Promise.resolve(toBeHex('0x456', 20)))
    jest.spyOn(web3, 'getWeb3ReadOnly').mockReturnValue({
      send: mockReadOnlySend,
    } as any)

    jest.spyOn(useMPC, '_getMPCCoreKitInstance').mockImplementation(() => {
      return {
        provider: {
          request: mockMPCProviderRequest,
        },
      } as any
    })

    const mpcModule = MpcModule(mockChain)({
      device: {
        browser: {
          name: 'Firefox',
          version: '1.0',
        },
        os: {
          name: 'macOS',
          version: '1.0',
        },
        type: 'desktop',
      },
    })
    const walletModule = mpcModule as WalletModule
    const walletInterface = await walletModule.getInterface({} as any)

    await walletInterface.provider.request({
      method: 'eth_requestAccounts',
    })

    expect(mockMPCProviderRequest).toHaveBeenCalledWith({ method: 'eth_accounts' })
  })
})
