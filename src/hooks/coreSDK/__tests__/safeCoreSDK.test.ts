import { ethers } from 'ethers'
import Safe from '@safe-global/safe-core-sdk'
import {
  getProxyFactoryContract,
  getSafeContract,
} from '@safe-global/safe-core-sdk/dist/src/contracts/safeDeploymentContracts'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import { Web3Provider } from '@ethersproject/providers'

import { initSafeSDK, isValidSafeVersion } from '../safeCoreSDK'

jest.mock('@/services/contracts/safeContracts', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@/services/contracts/safeContracts'),
  }
})

jest.mock('@safe-global/safe-core-sdk/dist/src/contracts/safeDeploymentContracts')

jest.mock('@/types/contracts', () => {
  return {
    __esModule: true,
    ...jest.requireActual('@/types/contracts'),
  }
})

describe('safeCoreSDK', () => {
  describe('isValidSafeVersion', () => {
    it('should return true for valid versions', () => {
      expect(isValidSafeVersion('1.3.0')).toBe(true)

      expect(isValidSafeVersion('1.2.0')).toBe(true)

      expect(isValidSafeVersion('1.1.1')).toBe(true)

      expect(isValidSafeVersion('1.3.0+L2')).toBe(true)
    })
    it('should return false for invalid versions', () => {
      expect(isValidSafeVersion('1.3.1')).toBe(false)

      expect(isValidSafeVersion('1.4.0')).toBe(false)

      expect(isValidSafeVersion('1.0.0')).toBe(true)

      expect(isValidSafeVersion('0.0.1')).toBe(false)

      expect(isValidSafeVersion('')).toBe(false)

      expect(isValidSafeVersion()).toBe(false)
    })
  })

  describe('initSafeSDK', () => {
    const MAINNET_MASTER_COPY = '0xd9Db270c1B5E3Bd161E8c8503c55cEABeE709552' // L1
    const POLYGON_MASTER_COPY = '0x3E5c63644E683549055b9Be8653de26E0B4CD36E' // L2

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

    const getMockProvider = (chainId: string, version: string) => {
      return new Web3Provider(
        jest.fn((method, params) => {
          const VERSION_SIG_HASH = ethers.utils.id('VERSION()').slice(0, 10)

          if (method === 'eth_chainId') {
            return Promise.resolve(+chainId)
          }

          if (method === 'eth_call' && params?.[0].data.startsWith(VERSION_SIG_HASH)) {
            const encodedVersion = ethers.utils.defaultAbiCoder.encode(['string'], [version])

            return Promise.resolve(encodedVersion)
          }

          return Promise.resolve()
        }),
      )
    }

    describe('Supported contracts', () => {
      it('should return an SDK instance', async () => {
        const chainId = '1'
        const version = '1.3.0'

        const mockProvider = getMockProvider(chainId, version)

        const sdk = await initSafeSDK({
          provider: mockProvider,
          chainId,
          address: ethers.utils.hexZeroPad('0x1', 20),
          version,
          implementation: MAINNET_MASTER_COPY,
          implementationVersionState: ImplementationVersionState.UP_TO_DATE,
        })

        expect(sdk).toBeInstanceOf(Safe)
      })

      it('should return an L1 SDK instance for mainnet', async () => {
        const chainId = '1'
        const version = '1.3.0'

        const mockProvider = getMockProvider(chainId, version)

        const sdk = await initSafeSDK({
          provider: mockProvider,
          chainId,
          address: ethers.utils.hexZeroPad('0x1', 20),
          version,
          implementation: MAINNET_MASTER_COPY,
          implementationVersionState: ImplementationVersionState.UP_TO_DATE,
        })

        expect(sdk).toBeInstanceOf(Safe)
        expect(sdk?.getContractManager().isL1SafeMasterCopy).toBe(true)
      })

      it('should return an L2 SDK instance for L2 chain', async () => {
        const chainId = '137' // Polygon
        const version = '1.3.0'

        const mockProvider = getMockProvider(chainId, version)

        const sdk = await initSafeSDK({
          provider: mockProvider,
          chainId,
          address: ethers.utils.hexZeroPad('0x1', 20),
          version: `${version}+L2`,
          implementation: POLYGON_MASTER_COPY,
          implementationVersionState: ImplementationVersionState.UP_TO_DATE,
        })

        expect(sdk).toBeInstanceOf(Safe)
        expect(sdk?.getContractManager().isL1SafeMasterCopy).toBe(false)
      })

      it('should return an L1 SDK instance for legacy Safes, regardless of chain', async () => {
        const chainId = '137' // Polygon
        const version = '1.0.0'

        const mockProvider = getMockProvider(chainId, version)

        const sdk = await initSafeSDK({
          provider: mockProvider,
          chainId,
          address: ethers.utils.hexZeroPad('0x1', 20),
          version,
          implementation: POLYGON_MASTER_COPY,
          implementationVersionState: ImplementationVersionState.OUTDATED,
        })

        expect(sdk).toBeInstanceOf(Safe)
        expect(sdk?.getContractManager().isL1SafeMasterCopy).toBe(true)
      })
    })

    describe('Unsupported contracts', () => {
      // Note: backend returns a null version for unsupported contracts
      it('should retrieve the Safe version from the contract if not provided', async () => {
        const chainId = '1'
        const version = '1.3.0'

        const mockProvider = getMockProvider(chainId, version)

        const sdk = await initSafeSDK({
          provider: mockProvider,
          chainId: '1',
          address: ethers.utils.hexZeroPad('0x1', 20),
          version: null, // Indexer returns null if unsupported contract version
          implementation: MAINNET_MASTER_COPY,
          implementationVersionState: ImplementationVersionState.UNKNOWN,
        })

        expect(sdk).toBeInstanceOf(Safe)
      })

      it('should return an L1 SDK instance for L1 contracts not deployed on mainnet', async () => {
        const chainId = '137' // Polygon
        const version = '1.3.0'

        const mockProvider = getMockProvider(chainId, version)

        const sdk = await initSafeSDK({
          provider: mockProvider,
          chainId,
          address: ethers.utils.hexZeroPad('0x1', 20),
          version: null,
          implementation: MAINNET_MASTER_COPY,
          implementationVersionState: ImplementationVersionState.UNKNOWN,
        })

        expect(sdk).toBeInstanceOf(Safe)
        expect(sdk?.getContractManager().isL1SafeMasterCopy).toBe(true)
      })

      it('should return undefined for unsupported mastercopies', async () => {
        const chainId = '1'
        const version = '1.3.0'

        const mockProvider = getMockProvider(chainId, version)

        const sdk = await initSafeSDK({
          provider: mockProvider,
          chainId,
          address: ethers.utils.hexZeroPad('0x1', 20),
          version: null,
          implementation: '0xinvalid',
          implementationVersionState: ImplementationVersionState.UNKNOWN,
        })

        expect(sdk).toBeUndefined()
      })
    })
  })
})
