import { Web3Provider } from '@ethersproject/providers'
import {
  getProxyFactoryContract,
  getSafeContract,
} from '@safe-global/safe-core-sdk/dist/src/contracts/safeDeploymentContracts'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import type { EIP1193Provider } from '@web3-onboard/core'

import * as coreSdk from '../safeCoreSDK'
import { hexZeroPad } from 'ethers/lib/utils'

jest.mock('../safeCoreSDK', () => {
  return {
    __esModule: true,
    ...jest.requireActual('../safeCoreSDK'),
  }
})

jest.mock('@safe-global/safe-core-sdk/dist/src/contracts/safeDeploymentContracts', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@safe-global/safe-core-sdk/dist/src/contracts/safeDeploymentContracts'),
    getProxyFactoryContract: jest.fn(),
    getSafeContract: jest.fn(),
  }
})

jest.mock('@/types/contracts', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@/types/contracts'),
  }
})

describe('safeCoreSDK', () => {
  describe('isValidSafeVersion', () => {
    it('should return true for valid versions', () => {
      expect(coreSdk.isValidSafeVersion('1.3.0')).toBe(true)

      expect(coreSdk.isValidSafeVersion('1.2.0')).toBe(true)

      expect(coreSdk.isValidSafeVersion('1.1.1')).toBe(true)

      expect(coreSdk.isValidSafeVersion('1.3.0+L2')).toBe(true)
    })
    it('should return false for invalid versions', () => {
      expect(coreSdk.isValidSafeVersion('1.3.1')).toBe(false)

      expect(coreSdk.isValidSafeVersion('1.4.0')).toBe(false)

      expect(coreSdk.isValidSafeVersion('1.0.0')).toBe(true)

      expect(coreSdk.isValidSafeVersion('0.0.1')).toBe(false)

      expect(coreSdk.isValidSafeVersion('')).toBe(false)

      expect(coreSdk.isValidSafeVersion()).toBe(false)
    })
  })

  describe('initSafeSDK', () => {
    const MAINNET_MASTER_COPY = '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552' // L1
    const GNOSIS_CHAIN_MASTER_COPY = '0x3E5c63644E683549055b9Be8653de26E0B4CD36E' // L2

    ;(getProxyFactoryContract as jest.Mock).mockImplementation(async () => {
      return await Promise.resolve({
        getAddress: jest.fn(),
        proxyCreationCode: jest.fn(),
        createProxy: jest.fn(),
        encode: jest.fn(),
        estimateGas: jest.fn(),
      })
    })
    ;(getSafeContract as jest.Mock).mockImplementation(async () => {
      return await Promise.resolve({
        setup: jest.fn(),
        getVersion: jest.fn(),
        getAddress: jest.fn(),
        getNonce: jest.fn(),
        getThreshold: jest.fn(),
        getOwners: jest.fn(),
        isOwner: jest.fn(),
        getTransactionHash: jest.fn(),
        approvedHashes: jest.fn(),
        approveHash: jest.fn(),
        getModules: jest.fn(),
        isModuleEnabled: jest.fn(),
        isValidTransaction: jest.fn(),
        execTransaction: jest.fn(),
        encode: jest.fn(),
        estimateGas: jest.fn(),
      })
    })

    it('should return an SDK instance', async () => {
      const chainId = '1'

      const provider = new Web3Provider(
        jest.fn((method, params) => {
          if (method === 'eth_chainId') {
            return Promise.resolve({ chainId: +chainId })
          }

          return Promise.resolve()
        }),
      )

      const sdk = await coreSdk.initSafeSDK(
        provider as unknown as EIP1193Provider,
        {
          chainId,
          address: { value: hexZeroPad('0x1', 20) },
          version: '1.3.0',
          implementation: { value: MAINNET_MASTER_COPY },
        } as SafeInfo,
      )

      expect(sdk).toBeDefined()
    })

    // it('should retrieve the Safe version from the contract if not provided', async () => {
    //   const versionSpy = jest.spyOn(types, 'Gnosis_safe__factory').mockImplementation(() => ({
    //     connect: () => ({
    //       VERSION: () => '1.3.0',
    //     }),
    //   }))

    //   const sdk = await initSafeSDK(mockProvider, {
    //     chainId: '1',
    //     address: { value: hexZeroPad('0x1', 20) },
    //     version: null,
    //     implementation: { value: MAINNET_MASTER_COPY },
    //   } as SafeInfo)

    //   expect(sdk).toBeDefined()
    //   expect(versionSpy).toHaveBeenCalledTimes(1)
    // })

    // it('should return an L1 SDK instance for mainnet', async () => {
    //   const sdk = await initSafeSDK(mockProvider, {
    //     chainId: '1',
    //     address: { value: hexZeroPad('0x1', 20) },
    //     version: '1.3.0',
    //     implementation: { value: MAINNET_MASTER_COPY },
    //   } as SafeInfo)

    //   expect(sdk).toBeDefined()
    //   expect(sdk?.getContractManager().isL1SafeMasterCopy).toBe(true)
    // })

    // it('should return an L2 SDK instance for L2 chain', async () => {
    //   const sdk = await initSafeSDK(mockProvider, {
    //     chainId: '100', // Gnosis Chain
    //     address: { value: hexZeroPad('0x1', 20) },
    //     version: '1.3.0',
    //     implementation: { value: GNOSIS_CHAIN_MASTER_COPY },
    //   } as SafeInfo)

    //   expect(sdk).toBeDefined()
    //   expect(sdk?.getContractManager().isL1SafeMasterCopy).toBe(false)
    // })

    // it('should return an L1 SDK instance for legacy Safes, regardless of chain', async () => {
    //   const sdk = await initSafeSDK(mockProvider, {
    //     chainId: '100', // Gnosis Chain
    //     address: { value: hexZeroPad('0x1', 20) },
    //     version: '1.0.0',
    //     implementation: { value: GNOSIS_CHAIN_MASTER_COPY },
    //   } as SafeInfo)

    //   expect(sdk).toBeDefined()
    //   expect(sdk?.getContractManager().isL1SafeMasterCopy).toBe(true)
    // })

    // it('should return an L1 SDK instance for L1 contracts not deployed on mainnet', async () => {
    //   const sdk = await initSafeSDK(mockProvider, {
    //     chainId: '100',
    //     address: { value: hexZeroPad('0x1', 20) },
    //     version: '1.3.0',
    //     implementation: { value: MAINNET_MASTER_COPY },
    //   } as SafeInfo)

    //   expect(sdk).toBeDefined()
    //   expect(sdk?.getContractManager().isL1SafeMasterCopy).toBe(true)
    // })

    // it('should return undefined for unsupported mastercopies', async () => {
    //   const safe = await initSafeSDK(mockProvider, {
    //     chainId: '1',
    //     address: { value: hexZeroPad('0x1', 20) },
    //     version: '1.3.0',
    //     implementation: { value: '0xinvalid' },
    //   } as SafeInfo)

    //   expect(safe).toBeUndefined()
    // })
  })
})
