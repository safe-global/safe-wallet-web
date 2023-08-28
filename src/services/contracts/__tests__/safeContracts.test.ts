import {
  getFallbackHandlerDeployment,
  getMultiSendCallOnlyDeployment,
  getProxyFactoryDeployment,
  getSafeL2SingletonDeployment,
  getSafeSingletonDeployment,
  getSignMessageLibDeployment,
} from '@safe-global/safe-deployments'
import { ImplementationVersionState } from '@safe-global/safe-gateway-typescript-sdk'
import type { ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

import {
  isValidMasterCopy,
  shouldPinDeploymentVersion,
  getPinnedDeploymentVersion,
  getMultiSendCallOnlyContractDeployment,
  getFallbackHandlerContractDeployment,
  getProxyFactoryContractDeployment,
  getSignMessageLibContractDeployment,
  getSafeContractDeployment,
} from '../safeContracts'

describe('safeContracts', () => {
  describe('isValidMasterCopy', () => {
    it('returns false if the implementation is unknown', async () => {
      const isValid = isValidMasterCopy(ImplementationVersionState.UNKNOWN)

      expect(isValid).toBe(false)
    })

    it('returns true if the implementation is up-to-date', async () => {
      const isValid = isValidMasterCopy(ImplementationVersionState.UP_TO_DATE)

      expect(isValid).toBe(true)
    })

    it('returns true if the implementation is outdated', async () => {
      const isValid = isValidMasterCopy(ImplementationVersionState.OUTDATED)

      expect(isValid).toBe(true)
    })
  })

  describe('shouldPinDeploymentVersion', () => {
    it('should return true if safeVersion is defined and satisfies the condition "safeVersion > LATEST_SAFE_VERSION"', () => {
      expect(shouldPinDeploymentVersion('1.4.1')).toBe(true)
    })

    it('should return false if safeVersion is defined and does not satisfy the condition "safeVersion > LATEST_SAFE_VERSION"', () => {
      expect(shouldPinDeploymentVersion('1.3.0')).toBe(false)
    })

    it('should return true if safeVersion is null and does not satisfy the condition "safeVersion > LATEST_SAFE_VERSION"', () => {
      expect(shouldPinDeploymentVersion(null)).toBe(false)
    })
  })

  describe('getPinnedDeploymentVersion', () => {
    it('should return LATEST_SAFE_VERSION if safeVersion is null', () => {
      expect(getPinnedDeploymentVersion(null)).toBe('1.3.0')
    })

    it('should return LATEST_SAFE_VERSION if safeVersion satisfies the condition "safeVersion > LATEST_SAFE_VERSION"', () => {
      expect(getPinnedDeploymentVersion('1.4.1')).toBe('1.3.0')
    })

    it('should return safeVersion without metadata if safeVersion does not satisfy the condition "safeVersion > LATEST_SAFE_VERSION"', () => {
      expect(getPinnedDeploymentVersion('1.0.0')).toBe('1.0.0')
      expect(getPinnedDeploymentVersion('1.1.1')).toBe('1.1.1')
      expect(getPinnedDeploymentVersion('1.2.0')).toBe('1.2.0')
      expect(getPinnedDeploymentVersion('1.3.0')).toBe('1.3.0')

      expect(getPinnedDeploymentVersion('1.3.0+L2')).toBe('1.3.0')
      expect(getPinnedDeploymentVersion('1.3.0+Circles')).toBe('1.3.0')
    })
  })

  describe('getSafeContractDeployment', () => {
    describe('when "safeVersion > LATEST_SAFE_VERSION"', () => {
      describe('when L1', () => {
        it('should return the LATEST_SAFE_VERSION deployment for the current chain if the chainId exists', () => {
          const deployment = getSafeSingletonDeployment({
            network: '5',
            version: '1.3.0',
          })

          expect(getSafeContractDeployment({ chainId: '5' } as ChainInfo, '1.4.1')).toStrictEqual(deployment)
        })

        it("should fallback to the default LATEST_SAFE_VERSION deployment if the chainId doesn't exist", () => {
          const deployment = getSafeSingletonDeployment({
            version: '1.3.0',
          })

          expect(getSafeContractDeployment({ chainId: '69420' } as ChainInfo, '1.4.1')).toStrictEqual(deployment)
        })
      })

      describe('when L2', () => {
        it('should return the LATEST_SAFE_VERSION deployment for the current chain if the chainId exists', () => {
          const deployment = getSafeL2SingletonDeployment({
            network: '137',
            version: '1.3.0',
          })

          expect(getSafeContractDeployment({ chainId: '137', l2: true } as ChainInfo, '1.4.1')).toStrictEqual(
            deployment,
          )
        })

        it("should fallback to the default LATEST_SAFE_VERSION deployment if the chainId doesn't exist", () => {
          const deployment = getSafeL2SingletonDeployment({
            version: '1.3.0',
          })

          expect(getSafeContractDeployment({ chainId: '69420', l2: true } as ChainInfo, '1.4.1')).toStrictEqual(
            deployment,
          )
        })
      })
    })

    describe('when "safeVersion <= LATEST_SAFE_VERSION"', () => {
      describe('when L1', () => {
        it('should return the safeVersion deployment for the current chain if the chainId exists', () => {
          const deployment = getSafeSingletonDeployment({
            network: '5',
            version: '1.0.0',
          })

          expect(getSafeContractDeployment({ chainId: '5' } as ChainInfo, '1.0.0')).toStrictEqual(deployment)
        })

        it("should fallback to the default safeVersion deployment if the chainId doesn't exist", () => {
          const deployment = getSafeSingletonDeployment({
            version: '1.0.0',
          })

          expect(getSafeContractDeployment({ chainId: '69420' } as ChainInfo, '1.0.0')).toStrictEqual(deployment)
        })

        it('should return 1.0.0 deployment when a "legacy version', () => {
          expect(() => getSafeContractDeployment({ chainId: '69420' } as ChainInfo, '0.0.1')).toThrow(
            new Error('0.0.1 is not a valid Safe Account version'),
          )
        })
      })

      describe('when L2', () => {
        it('should return the safeVersion deployment for the current chain if the chainId exists', () => {
          const deployment = getSafeL2SingletonDeployment({
            network: '137',
            version: '1.3.0',
          })

          expect(getSafeContractDeployment({ chainId: '137', l2: true } as ChainInfo, '1.3.0')).toStrictEqual(
            deployment,
          )
        })

        it("should fallback to the default safeVersion deployment if the chainId doesn't exist", () => {
          const deployment = getSafeL2SingletonDeployment({
            version: '1.3.0',
          })

          expect(getSafeContractDeployment({ chainId: '69420', l2: true } as ChainInfo, '1.3.0')).toStrictEqual(
            deployment,
          )
        })

        it('should return undefined deployment when a "legacy version', () => {
          expect(() => getSafeContractDeployment({ chainId: '69420', l2: true } as ChainInfo, '0.0.1')).toThrow(
            new Error('0.0.1 is not a valid Safe Account version'),
          )
        })
      })
    })
  })

  describe('getMultiSendCallOnlyContractDeployment', () => {
    describe('when safeVersion is null', () => {
      it('should return the LATEST_SAFE_VERSION deployment for the current chain if the chainId exists', () => {
        const deployment = getMultiSendCallOnlyDeployment({
          network: '5',
          version: '1.3.0',
        })

        expect(getMultiSendCallOnlyContractDeployment('5', null)).toStrictEqual(deployment)
      })

      it("should fallback to the default LATEST_SAFE_VERSION deployment if the chainId doesn't exist", () => {
        const deployment = getMultiSendCallOnlyDeployment({
          version: '1.3.0',
        })

        expect(getMultiSendCallOnlyContractDeployment('69420', null)).toStrictEqual(deployment)
      })
    })

    describe('when "safeVersion > LATEST_SAFE_VERSION"', () => {
      it('should return the LATEST_SAFE_VERSION deployment for the current chain if the chainId exists', () => {
        const deployment = getMultiSendCallOnlyDeployment({
          network: '5',
          version: '1.3.0',
        })

        expect(getMultiSendCallOnlyContractDeployment('5', null)).toStrictEqual(deployment)
      })

      it("should fallback to the default LATEST_SAFE_VERSION deployment if the chainId doesn't exist", () => {
        const deployment = getMultiSendCallOnlyDeployment({
          version: '1.3.0',
        })

        expect(getMultiSendCallOnlyContractDeployment('69420', null)).toStrictEqual(deployment)
      })
    })

    describe('when "safeVersion <= LATEST_SAFE_VERSION"', () => {
      it('should return the safeVersion deployment for the current chain if the chainId exists', () => {
        const deployment = getMultiSendCallOnlyDeployment({
          network: '5',
          version: '1.0.0',
        })

        expect(getMultiSendCallOnlyContractDeployment('5', '1.0.0')).toStrictEqual(deployment)
      })

      it("should fallback to the default safeVersion deployment if the chainId doesn't exist", () => {
        const deployment = getMultiSendCallOnlyDeployment({
          version: '1.0.0',
        })

        expect(getMultiSendCallOnlyContractDeployment('69420', '1.0.0')).toStrictEqual(deployment)
      })
    })
  })
  describe('getProxyFactoryContractDeployment', () => {
    describe('when "safeVersion > LATEST_SAFE_VERSION"', () => {
      it('should return the LATEST_SAFE_VERSION deployment for the current chain if the chainId exists', () => {
        const deployment = getProxyFactoryDeployment({
          network: '5',
          version: '1.3.0',
        })

        expect(getProxyFactoryContractDeployment('5', '1.4.1')).toStrictEqual(deployment)
      })

      it("should fallback to the default LATEST_SAFE_VERSION deployment if the chainId doesn't exist", () => {
        const deployment = getProxyFactoryDeployment({
          version: '1.3.0',
        })

        expect(getProxyFactoryContractDeployment('69420', '1.4.1')).toStrictEqual(deployment)
      })
    })

    describe('when "safeVersion <= LATEST_SAFE_VERSION"', () => {
      it('should return the safeVersion deployment for the current chain if the chainId exists', () => {
        const deployment = getProxyFactoryDeployment({
          network: '5',
          version: '1.0.0',
        })

        expect(getProxyFactoryContractDeployment('5', '1.0.0')).toStrictEqual(deployment)
      })

      it("should fallback to the default safeVersion deployment if the chainId doesn't exist", () => {
        const deployment = getProxyFactoryDeployment({
          version: '1.0.0',
        })

        expect(getProxyFactoryContractDeployment('69420', '1.0.0')).toStrictEqual(deployment)
      })
    })
  })
  describe('getFallbackHandlerContractDeployment', () => {
    describe('when safeVersion is null', () => {
      it('should return the LATEST_SAFE_VERSION deployment for the current chain if the chainId exists', () => {
        const deployment = getFallbackHandlerDeployment({
          network: '5',
          version: '1.3.0',
        })

        expect(getFallbackHandlerContractDeployment('5', null)).toStrictEqual(deployment)
      })

      it("should fallback to the default LATEST_SAFE_VERSION deployment if the chainId doesn't exist", () => {
        const deployment = getFallbackHandlerDeployment({
          version: '1.3.0',
        })

        expect(getFallbackHandlerContractDeployment('69420', null)).toStrictEqual(deployment)
      })
    })

    describe('when "safeVersion > LATEST_SAFE_VERSION"', () => {
      it('should return the LATEST_SAFE_VERSION deployment for the current chain if the chainId exists', () => {
        const deployment = getFallbackHandlerDeployment({
          network: '5',
          version: '1.3.0',
        })

        expect(getFallbackHandlerContractDeployment('5', null)).toStrictEqual(deployment)
      })

      it("should fallback to the default LATEST_SAFE_VERSION deployment if the chainId doesn't exist", () => {
        const deployment = getFallbackHandlerDeployment({
          version: '1.3.0',
        })

        expect(getFallbackHandlerContractDeployment('69420', null)).toStrictEqual(deployment)
      })
    })

    describe('when "safeVersion <= LATEST_SAFE_VERSION"', () => {
      it('should return the safeVersion deployment for the current chain if the chainId exists', () => {
        const deployment = getFallbackHandlerDeployment({
          network: '5',
          version: '1.0.0',
        })

        expect(getFallbackHandlerContractDeployment('5', '1.0.0')).toStrictEqual(deployment)
      })

      it("should fallback to the default safeVersion deployment if the chainId doesn't exist", () => {
        const deployment = getFallbackHandlerDeployment({
          version: '1.0.0',
        })

        expect(getFallbackHandlerContractDeployment('69420', '1.0.0')).toStrictEqual(deployment)
      })
    })
  })
  describe('getSignMessageLibContractDeployment', () => {
    describe('when "safeVersion > LATEST_SAFE_VERSION"', () => {
      it('should return the LATEST_SAFE_VERSION deployment for the current chain if the chainId exists', () => {
        const deployment = getSignMessageLibDeployment({
          network: '5',
          version: '1.3.0',
        })

        expect(getSignMessageLibContractDeployment('5', '1.4.1')).toStrictEqual(deployment)
      })

      it("should fallback to the default LATEST_SAFE_VERSION deployment if the chainId doesn't exist", () => {
        const deployment = getSignMessageLibDeployment({
          version: '1.3.0',
        })

        expect(getSignMessageLibContractDeployment('69420', '1.4.1')).toStrictEqual(deployment)
      })
    })

    describe('when "safeVersion <= LATEST_SAFE_VERSION"', () => {
      it('should return the safeVersion deployment for the current chain if the chainId exists', () => {
        const deployment = getSignMessageLibDeployment({
          network: '5',
          version: '1.0.0',
        })

        expect(getSignMessageLibContractDeployment('5', '1.0.0')).toStrictEqual(deployment)
      })

      it("should fallback to the default safeVersion deployment if the chainId doesn't exist", () => {
        const deployment = getSignMessageLibDeployment({
          version: '1.0.0',
        })

        expect(getSignMessageLibContractDeployment('69420', '1.0.0')).toStrictEqual(deployment)
      })
    })
  })
})
