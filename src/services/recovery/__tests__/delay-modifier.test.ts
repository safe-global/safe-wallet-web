import { faker } from '@faker-js/faker'
import type { JsonRpcProvider } from '@ethersproject/providers'

import { isOfficialDelayModifier } from '../delay-modifier'
import * as proxies from '../proxies'

const DELAY_MODULE = {
  '1.0.0': '0xD62129BF40CD1694b3d9D9847367783a1A4d5cB4',
  '1.0.1': '0xd54895B1121A2eE3f37b502F507631FA1331BED6',
}
const DELAY_MODULE_ADDRESSES = Object.values(DELAY_MODULE)

describe('delay-modifier', () => {
  describe('isOfficialDelayModifier', () => {
    DELAY_MODULE_ADDRESSES.forEach((moduleAddress) => {
      it('should return true for an official Delay Modifier', async () => {
        const chainId = '5'
        const bytecode = '0x' + faker.string.hexadecimal()
        const provider = {
          getCode: () => Promise.resolve(bytecode),
        } as unknown as JsonRpcProvider

        const isOfficial = await isOfficialDelayModifier(chainId, moduleAddress, provider)
        expect(isOfficial).toBe(true)
      })
    })

    it('should otherwise return false', async () => {
      const chainId = '5'
      const moduleAddress = faker.finance.ethereumAddress()
      const bytecode = '0x' + faker.string.hexadecimal()
      const provider = {
        getCode: () => Promise.resolve(bytecode),
      } as unknown as JsonRpcProvider

      const isOfficial = await isOfficialDelayModifier(chainId, moduleAddress, provider)
      expect(isOfficial).toBe(false)
    })

    describe('generic proxies', () => {
      const genericProxyBytecode =
        '0x363d3d373d3d3d363d73' + faker.string.hexadecimal({ length: 38 }) + '5af43d82803e903d91602b57fd5bf3'

      DELAY_MODULE_ADDRESSES.forEach((moduleAddress) => {
        it('should return true for an official Delay Modifier', async () => {
          const chainId = '5'
          const proxyAddress = faker.finance.ethereumAddress()
          const bytecode = faker.string.hexadecimal()
          const provider = {
            getCode: jest.fn().mockResolvedValueOnce(genericProxyBytecode).mockResolvedValue(bytecode),
          } as unknown as JsonRpcProvider

          jest.spyOn(proxies, 'getGenericProxyMasterCopy').mockReturnValue(moduleAddress)

          const isOfficial = await isOfficialDelayModifier(chainId, proxyAddress, provider)
          expect(isOfficial).toBe(true)
        })
      })

      it('should otherwise return false', async () => {
        const chainId = '5'
        const proxyAddress = faker.finance.ethereumAddress()
        const moduleAddress = faker.finance.ethereumAddress()
        const bytecode = faker.string.hexadecimal()
        const provider = {
          getCode: jest.fn().mockResolvedValueOnce(genericProxyBytecode).mockResolvedValue(bytecode),
        } as unknown as JsonRpcProvider

        jest.spyOn(proxies, 'getGenericProxyMasterCopy').mockReturnValue(moduleAddress)

        const isOfficial = await isOfficialDelayModifier(chainId, proxyAddress, provider)
        expect(isOfficial).toBe(false)
      })
    })

    describe('Gnosis generic proxies', () => {
      const gnosisGenericProxyBytecode =
        '0x608060405273ffffffffffffffffffffffffffffffffffffffff600054167fa619486e0000000000000000000000000000000000000000000000000000000060003514156050578060005260206000f35b3660008037600080366000845af43d6000803e60008114156070573d6000fd5b3d6000f3fea265627a7a72315820d8a00dc4fe6bf675a9d7416fc2d00bb3433362aa8186b750f76c4027269667ff64736f6c634300050e0032'

      DELAY_MODULE_ADDRESSES.forEach((moduleAddress) => {
        it('should return true for an official Delay Modifier', async () => {
          const chainId = '5'
          const proxyAddress = faker.finance.ethereumAddress()
          const bytecode = faker.string.hexadecimal()
          const provider = {
            getCode: jest.fn().mockResolvedValueOnce(gnosisGenericProxyBytecode).mockResolvedValue(bytecode),
          } as unknown as JsonRpcProvider

          jest.spyOn(proxies, 'getGnosisGenericProxyMasterCopy').mockResolvedValue(moduleAddress)

          const isOfficial = await isOfficialDelayModifier(chainId, proxyAddress, provider)
          expect(isOfficial).toBe(true)
        })
      })

      it('should otherwise return false', async () => {
        const chainId = '5'
        const proxyAddress = faker.finance.ethereumAddress()
        const moduleAddress = faker.finance.ethereumAddress()
        const bytecode = faker.string.hexadecimal()
        const provider = {
          getCode: jest.fn().mockResolvedValueOnce(gnosisGenericProxyBytecode).mockResolvedValue(bytecode),
        } as unknown as JsonRpcProvider

        jest.spyOn(proxies, 'getGnosisGenericProxyMasterCopy').mockResolvedValue(moduleAddress)

        const isOfficial = await isOfficialDelayModifier(chainId, proxyAddress, provider)
        expect(isOfficial).toBe(false)
      })
    })
  })
})
