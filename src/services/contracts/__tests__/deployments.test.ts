import { LATEST_SAFE_VERSION } from '@/config/constants'
import * as safeDeployments from '@safe-global/safe-deployments'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import * as deployments from '../deployments'

describe('deployments', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('tryDeploymentVersions', () => {
    const getSafeSpy = jest.spyOn(safeDeployments, 'getSafeSingletonDeployment')

    it('should call the deployment getter with a supported version/network', () => {
      deployments._tryDeploymentVersions(
        getSafeSpy as unknown as typeof safeDeployments.getSafeSingletonDeployment,
        '1',
        '1.1.1',
      )

      expect(getSafeSpy).toHaveBeenCalledTimes(1)

      expect(getSafeSpy).toHaveBeenNthCalledWith(1, {
        version: '1.1.1',
        network: '1',
      })
    })

    it('should call the deployment getter with a supported version/unsupported network', () => {
      deployments._tryDeploymentVersions(
        getSafeSpy as unknown as typeof safeDeployments.getSafeSingletonDeployment,
        '69420',
        '1.1.1',
      )

      expect(getSafeSpy).toHaveBeenCalledTimes(1)

      expect(getSafeSpy).toHaveBeenNthCalledWith(1, {
        version: '1.1.1',
        network: '69420',
      })
    })

    it('should call the deployment getter with an unsupported version/unsupported', () => {
      deployments._tryDeploymentVersions(
        getSafeSpy as unknown as typeof safeDeployments.getSafeSingletonDeployment,
        '69420',
        '1.2.3',
      )

      expect(getSafeSpy).toHaveBeenCalledTimes(1)

      expect(getSafeSpy).toHaveBeenNthCalledWith(1, {
        version: '1.2.3',
        network: '69420',
      })
    })

    it('should call the deployment getter with the latest version/supported network if no version is provider', () => {
      deployments._tryDeploymentVersions(
        getSafeSpy as unknown as typeof safeDeployments.getSafeSingletonDeployment,
        '1',
        null,
      )

      expect(getSafeSpy).toHaveBeenCalledTimes(1)

      expect(getSafeSpy).toHaveBeenNthCalledWith(1, {
        version: '1.3.0',
        network: '1',
      })
    })

    it('should call the deployment getter with the latest version/unsupported network if no version is provider', () => {
      deployments._tryDeploymentVersions(
        getSafeSpy as unknown as typeof safeDeployments.getSafeSingletonDeployment,
        '69420',
        null,
      )

      expect(getSafeSpy).toHaveBeenCalledTimes(1)

      expect(getSafeSpy).toHaveBeenNthCalledWith(1, {
        network: '69420',
        version: '1.3.0',
      })
    })
  })

  describe('isLegacy', () => {
    it('should return true for legacy versions', () => {
      expect(deployments._isLegacy('0.0.1')).toBe(true)
      expect(deployments._isLegacy('1.0.0')).toBe(true)
    })

    it('should return false for non-legacy versions', () => {
      expect(deployments._isLegacy('1.1.1')).toBe(false)
      expect(deployments._isLegacy('1.2.0')).toBe(false)
      expect(deployments._isLegacy('1.3.0')).toBe(false)
      expect(deployments._isLegacy(LATEST_SAFE_VERSION)).toBe(false)
    })

    it('should return false for unsupported versions', () => {
      expect(deployments._isLegacy(null)).toBe(false)
    })
  })

  describe('isL2', () => {
    it('should return true for L2 versions', () => {
      expect(deployments._isL2({ l2: true } as ChainInfo, '1.3.0')).toBe(true)
      expect(deployments._isL2({ l2: true } as ChainInfo, '1.3.0+L2')).toBe(true)
      expect(deployments._isL2({ l2: true } as ChainInfo, LATEST_SAFE_VERSION)).toBe(true)
      expect(deployments._isL2({ l2: true } as ChainInfo, `${LATEST_SAFE_VERSION}+L2`)).toBe(true)
    })

    it('should return true for unsupported L2 versions', () => {
      expect(deployments._isL2({ l2: true } as ChainInfo, null)).toBe(true)
    })

    it('should return false for non-L2 versions', () => {
      expect(deployments._isL2({ l2: false } as ChainInfo, '1.0.0')).toBe(false)
      expect(deployments._isL2({ l2: false } as ChainInfo, '1.1.1')).toBe(false)
      expect(deployments._isL2({ l2: false } as ChainInfo, '1.2.0')).toBe(false)
      expect(deployments._isL2({ l2: false } as ChainInfo, '1.3.0')).toBe(false)
      expect(deployments._isL2({ l2: false } as ChainInfo, LATEST_SAFE_VERSION)).toBe(false)
    })
  })

  describe('getSafeContractDeployment', () => {
    describe('L1', () => {
      it('should return the versioned deployment for supported version/chain', () => {
        const expected = safeDeployments.getSafeSingletonDeployment({
          version: '1.1.1',
          network: '1',
        })

        expect(expected).toBeDefined()
        const deployment = deployments.getSafeContractDeployment({ chainId: '1' } as ChainInfo, '1.1.1')
        expect(deployment).toStrictEqual(expected)
      })

      it('should return undefined for supported version/unsupported chain', () => {
        const deployment = deployments.getSafeContractDeployment({ chainId: '69420' } as ChainInfo, '1.1.1')
        expect(deployment).toBe(undefined)
      })

      it('should return the oldest deployment for legacy version/supported chain', () => {
        const expected = safeDeployments.getSafeSingletonDeployment({
          version: '1.0.0', // First available version
        })

        expect(expected).toBeDefined()
        const deployment = deployments.getSafeContractDeployment({ chainId: '1' } as ChainInfo, '0.0.1')
        expect(deployment).toStrictEqual(expected)
      })

      it('should return the oldest deployment for legacy version/unsupported chain', () => {
        const expected = safeDeployments.getSafeSingletonDeployment({
          version: '1.0.0', // First available version
        })

        expect(expected).toBeDefined()
        const deployment = deployments.getSafeContractDeployment({ chainId: '69420' } as ChainInfo, '0.0.1')
        expect(deployment).toStrictEqual(expected)
      })

      it('should return undefined for unsupported version/chain', () => {
        const deployment = deployments.getSafeContractDeployment({ chainId: '69420' } as ChainInfo, '1.2.3')
        expect(deployment).toStrictEqual(undefined)
      })

      it('should return the latest deployment for no version/supported chain', () => {
        const expected = safeDeployments.getSafeSingletonDeployment({
          version: LATEST_SAFE_VERSION,
          network: '1',
        })

        expect(expected).toBeDefined()
        const deployment = deployments.getSafeContractDeployment({ chainId: '1' } as ChainInfo, null)
        expect(deployment).toStrictEqual(expected)
      })

      it('should return undefined for no version/unsupported chain', () => {
        const deployment = deployments.getSafeContractDeployment({ chainId: '69420' } as ChainInfo, null)
        expect(deployment).toBe(undefined)
      })
    })

    describe('L2', () => {
      it('should return the versioned deployment for supported version/chain', () => {
        const expected = safeDeployments.getSafeL2SingletonDeployment({
          version: '1.3.0', // First available version
          network: '1',
        })

        expect(expected).toBeDefined()
        const deployment = deployments.getSafeContractDeployment({ chainId: '1', l2: true } as ChainInfo, '1.3.0')
        expect(deployment).toStrictEqual(expected)
      })

      it('should return undefined for supported version/unsupported chain', () => {
        const deployment = deployments.getSafeContractDeployment({ chainId: '69420', l2: true } as ChainInfo, '1.3.0')
        expect(deployment).toBe(undefined)
      })

      it('should return undefined for unsupported version/chain', () => {
        const expected = safeDeployments.getSafeSingletonDeployment({
          version: LATEST_SAFE_VERSION,
        })

        expect(expected).toBeDefined()
        const deployment = deployments.getSafeContractDeployment({ chainId: '69420' } as ChainInfo, '1.2.3')
        expect(deployment).toBe(undefined)
      })

      it('should return the latest deployment for no version/supported chain', () => {
        const expected = safeDeployments.getSafeL2SingletonDeployment({
          version: LATEST_SAFE_VERSION,
          network: '1',
        })

        expect(expected).toBeDefined()
        const deployment = deployments.getSafeContractDeployment({ chainId: '1', l2: true } as ChainInfo, null)
        expect(deployment).toStrictEqual(expected)
      })

      it('should return undefined no version/unsupported chain', () => {
        const deployment = deployments.getSafeContractDeployment({ chainId: '69420', l2: true } as ChainInfo, null)
        expect(deployment).toStrictEqual(undefined)
      })
    })
  })

  describe('getMultiSendCallOnlyContractDeployment', () => {
    it('should return the versioned deployment for supported version/chain', () => {
      const expected = safeDeployments.getMultiSendCallOnlyDeployment({
        version: '1.3.0', // First available version
        network: '1',
      })

      expect(expected).toBeDefined()
      const deployment = deployments.getMultiSendCallOnlyContractDeployment('1', '1.3.0')
      expect(deployment).toStrictEqual(expected)
    })

    it('should return undefined for supported version/unsupported chain', () => {
      const deployment = deployments.getMultiSendCallOnlyContractDeployment('69420', '1.3.0')
      expect(deployment).toBe(undefined)
    })

    it('should return undefined for unsupported version/chain', () => {
      const deployment = deployments.getMultiSendCallOnlyContractDeployment('69420', '1.2.3')
      expect(deployment).toBe(undefined)
    })

    it('should return the latest deployment for no version/supported chain', () => {
      const expected = safeDeployments.getMultiSendCallOnlyDeployment({
        version: LATEST_SAFE_VERSION,
        network: '1',
      })

      expect(expected).toBeDefined()
      const deployment = deployments.getMultiSendCallOnlyContractDeployment('1', null)
      expect(deployment).toStrictEqual(expected)
    })

    it('should return undefined for no version/unsupported chain', () => {
      const deployment = deployments.getMultiSendCallOnlyContractDeployment('69420', null)
      expect(deployment).toBe(undefined)
    })
  })

  describe('getFallbackHandlerContractDeployment', () => {
    it('should return the versioned deployment for supported version/chain', () => {
      const expected = safeDeployments.getFallbackHandlerDeployment({
        version: '1.3.0', // First available version
        network: '1',
      })

      expect(expected).toBeDefined()
      const deployment = deployments.getFallbackHandlerContractDeployment('1', '1.3.0')
      expect(deployment).toStrictEqual(expected)
    })

    it('should return undefined for supported version/unsupported chain', () => {
      const deployment = deployments.getFallbackHandlerContractDeployment('69420', '1.3.0')
      expect(deployment).toBe(undefined)
    })

    it('should return undefined for unsupported version/chain', () => {
      const deployment = deployments.getFallbackHandlerContractDeployment('69420', '1.2.3')
      expect(deployment).toBe(undefined)
    })

    it('should return the latest deployment for no version/supported chain', () => {
      const expected = safeDeployments.getFallbackHandlerDeployment({
        version: LATEST_SAFE_VERSION,
        network: '1',
      })

      expect(expected).toBeDefined()
      const deployment = deployments.getFallbackHandlerContractDeployment('1', null)
      expect(deployment).toStrictEqual(expected)
    })

    it('should return undefined for no version/unsupported chain', () => {
      const deployment = deployments.getFallbackHandlerContractDeployment('69420', null)
      expect(deployment).toBe(undefined)
    })
  })

  describe('getProxyFactoryContractDeployment', () => {
    it('should return the versioned deployment for supported version/chain', () => {
      const expected = safeDeployments.getProxyFactoryDeployment({
        version: '1.1.1', // First available version
        network: '1',
      })

      expect(expected).toBeDefined()
      const deployment = deployments.getProxyFactoryContractDeployment('1', '1.1.1')
      expect(deployment).toStrictEqual(expected)
    })

    it('should return undefined for supported version/unsupported chain', () => {
      const deployment = deployments.getProxyFactoryContractDeployment('69420', '1.1.1')
      expect(deployment).toBe(undefined)
    })

    it('should return undefined for unsupported version/chain', () => {
      const deployment = deployments.getProxyFactoryContractDeployment('69420', '1.2.3')
      expect(deployment).toBe(undefined)
    })

    it('should return the latest deployment for no version/supported chain', () => {
      const expected = safeDeployments.getProxyFactoryDeployment({
        version: LATEST_SAFE_VERSION,
        network: '1',
      })

      expect(expected).toBeDefined()
      const deployment = deployments.getProxyFactoryContractDeployment('1', null)
      expect(deployment).toStrictEqual(expected)
    })

    it('should return undefined for no version/unsupported chain', () => {
      const deployment = deployments.getProxyFactoryContractDeployment('69420', null)
      expect(deployment).toBe(undefined)
    })
  })

  describe('getSignMessageLibContractDeployment', () => {
    it('should return the versioned deployment for supported version/chain', () => {
      const expected = safeDeployments.getSignMessageLibDeployment({
        version: '1.3.0', // First available version
        network: '1',
      })

      expect(expected).toBeDefined()
      const deployment = deployments.getSignMessageLibContractDeployment('1', '1.3.0')
      expect(deployment).toStrictEqual(expected)
    })

    it('should return undefined for supported version/unsupported chain', () => {
      const deployment = deployments.getSignMessageLibContractDeployment('69420', '1.3.0')
      expect(deployment).toBe(undefined)
    })

    it('should return undefined for unsupported version/chain', () => {
      const deployment = deployments.getSignMessageLibContractDeployment('69420', '1.2.3')
      expect(deployment).toBe(undefined)
    })

    it('should return the latest deployment for no version/supported chain', () => {
      const expected = safeDeployments.getSignMessageLibDeployment({
        version: LATEST_SAFE_VERSION,
        network: '1',
      })

      expect(expected).toBeDefined()
      const deployment = deployments.getSignMessageLibContractDeployment('1', null)
      expect(deployment).toStrictEqual(expected)
    })

    it('should return undefined for no version/unsupported chain', () => {
      const deployment = deployments.getSignMessageLibContractDeployment('69420', null)
      expect(deployment).toBe(undefined)
    })
  })
})
