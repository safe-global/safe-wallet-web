import { sameAddress } from '@/utils/addresses'
import {
  getFallbackHandlerDeployment,
  getSafeL2SingletonDeployment,
  getSafeSingletonDeployment,
} from '@safe-global/safe-deployments'
import type { ChainInfo, SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { Interface, BrowserProvider, type JsonRpcProvider } from 'ethers'
import { createUpdateSafeTxs } from '../safeUpdateParams'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import * as web3 from '@/hooks/wallets/web3'
import { MockEip1193Provider } from '@/tests/mocks/providers'

const MOCK_SAFE_ADDRESS = '0x0000000000000000000000000000000000005AFE'

jest.mock('@safe-global/protocol-kit', () => {
  const originalModule = jest.requireActual('@safe-global/protocol-kit')

  // Mock class
  class MockEthersAdapter extends originalModule.EthersAdapter {
    getChainId = jest.fn().mockImplementation(() => Promise.resolve(BigInt(4)))
  }

  return {
    ...originalModule,
    EthersAdapter: MockEthersAdapter,
  }
})

describe('safeUpgradeParams', () => {
  jest
    .spyOn(web3, 'getWeb3ReadOnly')
    .mockImplementation(() => new BrowserProvider(MockEip1193Provider) as unknown as JsonRpcProvider)

  it('Should add empty setFallbackHandler transaction data for older Safes', async () => {
    const mockSafe = {
      address: {
        value: MOCK_SAFE_ADDRESS,
      },
      version: '1.0.0',
    } as SafeInfo
    const txs = await createUpdateSafeTxs(mockSafe, { chainId: '4', l2: false } as ChainInfo)
    const [masterCopyTx, fallbackHandlerTx] = txs
    // Safe upgrades mastercopy and fallbackhandler
    expect(txs).toHaveLength(2)
    // Check change masterCopy
    expect(sameAddress(masterCopyTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(masterCopyTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeChangeMasterCopyAddress(masterCopyTx.data),
        getSafeSingletonDeployment({ version: '1.3.0', network: '4' })?.defaultAddress,
      ),
    ).toBeTruthy()

    // Check setFallbackHandler
    expect(sameAddress(fallbackHandlerTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(fallbackHandlerTx.value).toEqual('0')
    expect(fallbackHandlerTx.data).toEqual('0x')
  })

  it('Should upgrade L1 safe to L1 1.3.0', async () => {
    const mockSafe = {
      address: {
        value: MOCK_SAFE_ADDRESS,
      },
      version: '1.1.1',
    } as SafeInfo
    const txs = await createUpdateSafeTxs(mockSafe, { chainId: '4', l2: false } as ChainInfo)
    const [masterCopyTx, fallbackHandlerTx] = txs
    // Safe upgrades mastercopy and fallbackhandler
    expect(txs).toHaveLength(2)
    // Check change masterCopy
    expect(sameAddress(masterCopyTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(masterCopyTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeChangeMasterCopyAddress(masterCopyTx.data),
        getSafeSingletonDeployment({ version: '1.3.0', network: '4' })?.defaultAddress,
      ),
    ).toBeTruthy()

    // Check setFallbackHandler
    expect(sameAddress(fallbackHandlerTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(fallbackHandlerTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeSetFallbackHandlerAddress(fallbackHandlerTx.data),
        getFallbackHandlerDeployment({ version: LATEST_SAFE_VERSION, network: '4' })?.defaultAddress,
      ),
    ).toBeTruthy()
  })

  it('Should upgrade L2 safe to L2 1.3.0', async () => {
    const mockSafe = {
      address: {
        value: MOCK_SAFE_ADDRESS,
      },
      version: '1.1.1',
    } as SafeInfo
    const txs = await createUpdateSafeTxs(mockSafe, { chainId: '100', l2: true } as ChainInfo)
    const [masterCopyTx, fallbackHandlerTx] = txs
    // Safe upgrades mastercopy and fallbackhandler
    expect(txs).toHaveLength(2)
    // Check change masterCopy
    expect(sameAddress(masterCopyTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(masterCopyTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeChangeMasterCopyAddress(masterCopyTx.data),
        getSafeL2SingletonDeployment({ version: '1.3.0', network: '100' })?.defaultAddress,
      ),
    ).toBeTruthy()

    // Check setFallbackHandler
    expect(sameAddress(fallbackHandlerTx.to, MOCK_SAFE_ADDRESS)).toBeTruthy()
    expect(fallbackHandlerTx.value).toEqual('0')
    expect(
      sameAddress(
        decodeSetFallbackHandlerAddress(fallbackHandlerTx.data),
        getFallbackHandlerDeployment({ version: '1.3.0', network: '100' })?.defaultAddress,
      ),
    ).toBeTruthy()
  })
})

const decodeChangeMasterCopyAddress = (data: string): string => {
  const CHANGE_MASTER_COPY_ABI = 'function changeMasterCopy(address _masterCopy)'

  const multiSendInterface = new Interface([CHANGE_MASTER_COPY_ABI])
  const decodedAddress = multiSendInterface.decodeFunctionData('changeMasterCopy', data)[0]
  return decodedAddress.toString()
}

const decodeSetFallbackHandlerAddress = (data: string): string => {
  const CHANGE_FALLBACK_HANDLER_ABI = 'function setFallbackHandler(address handler)'

  const multiSendInterface = new Interface([CHANGE_FALLBACK_HANDLER_ABI])
  const decodedAddress = multiSendInterface.decodeFunctionData('setFallbackHandler', data)[0]
  return decodedAddress.toString()
}
