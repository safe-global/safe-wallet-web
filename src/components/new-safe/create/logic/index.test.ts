import { JsonRpcProvider } from 'ethers'
import { EMPTY_DATA, ZERO_ADDRESS } from '@safe-global/protocol-kit/dist/src/utils/constants'
import * as web3 from '@/hooks/wallets/web3'
import { relaySafeCreation } from '@/components/new-safe/create/logic/index'
import { relayTransaction, type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { toBeHex } from 'ethers'
import {
  Gnosis_safe__factory,
  Proxy_factory__factory,
} from '@/types/contracts/factories/@safe-global/safe-deployments/dist/assets/v1.3.0'
import {
  getReadOnlyFallbackHandlerContract,
  getReadOnlyGnosisSafeContract,
  getReadOnlyProxyFactoryContract,
} from '@/services/contracts/safeContracts'
import { LATEST_SAFE_VERSION } from '@/config/constants'
import * as gateway from '@safe-global/safe-gateway-typescript-sdk'

const provider = new JsonRpcProvider(undefined, { name: 'rinkeby', chainId: 4 })

const mockTransaction = {
  data: EMPTY_DATA,
  nonce: 1,
  from: '0x10',
  to: '0x11',
  value: BigInt(0),
}

const mockPendingTx = {
  data: EMPTY_DATA,
  from: ZERO_ADDRESS,
  to: ZERO_ADDRESS,
  nonce: 0,
  startBlock: 0,
  value: BigInt(0),
}

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

describe('createNewSafeViaRelayer', () => {
  const owner1 = toBeHex('0x1', 20)
  const owner2 = toBeHex('0x2', 20)

  const mockChainInfo = {
    chainId: '5',
    l2: false,
  } as ChainInfo

  beforeAll(() => {
    jest.resetAllMocks()
    jest.spyOn(web3, 'getWeb3ReadOnly').mockImplementation(() => provider)
  })

  it('returns taskId if create Safe successfully relayed', async () => {
    jest.spyOn(gateway, 'relayTransaction').mockResolvedValue({ taskId: '0x123' })

    const expectedSaltNonce = 69
    const expectedThreshold = 1
    const proxyFactoryAddress = await (await getReadOnlyProxyFactoryContract('5', LATEST_SAFE_VERSION)).getAddress()
    const readOnlyFallbackHandlerContract = await getReadOnlyFallbackHandlerContract('5', LATEST_SAFE_VERSION)
    const safeContractAddress = await (await getReadOnlyGnosisSafeContract(mockChainInfo)).getAddress()

    const expectedInitializer = Gnosis_safe__factory.createInterface().encodeFunctionData('setup', [
      [owner1, owner2],
      expectedThreshold,
      ZERO_ADDRESS,
      EMPTY_DATA,
      await readOnlyFallbackHandlerContract.getAddress(),
      ZERO_ADDRESS,
      0,
      ZERO_ADDRESS,
    ])

    const expectedCallData = Proxy_factory__factory.createInterface().encodeFunctionData('createProxyWithNonce', [
      safeContractAddress,
      expectedInitializer,
      expectedSaltNonce,
    ])

    const taskId = await relaySafeCreation(mockChainInfo, [owner1, owner2], expectedThreshold, expectedSaltNonce)

    expect(taskId).toEqual('0x123')
    expect(relayTransaction).toHaveBeenCalledTimes(1)
    expect(relayTransaction).toHaveBeenCalledWith('5', {
      to: proxyFactoryAddress,
      data: expectedCallData,
      version: LATEST_SAFE_VERSION,
    })
  })

  it('should throw an error if relaying fails', () => {
    const relayFailedError = new Error('Relay failed')
    jest.spyOn(gateway, 'relayTransaction').mockRejectedValue(relayFailedError)

    expect(relaySafeCreation(mockChainInfo, [owner1, owner2], 1, 69)).rejects.toEqual(relayFailedError)
  })
})
