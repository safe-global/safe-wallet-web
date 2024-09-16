import { renderHook, waitFor } from '@/tests/test-utils'
import { SAFE_CREATION_DATA_ERRORS, useSafeCreationData } from '../useSafeCreationData'
import { faker } from '@faker-js/faker'
import { PendingSafeStatus, type UndeployedSafe } from '@/store/slices'
import { PayMethod } from '@/features/counterfactual/PayNowPayLater'
import { chainBuilder } from '@/tests/builders/chains'
import * as sdk from '@/services/tx/tx-sender/sdk'
import * as cgwSdk from 'safe-client-gateway-sdk'
import * as web3 from '@/hooks/wallets/web3'
import { encodeMultiSendData, type SafeProvider } from '@safe-global/protocol-kit'
import { Safe__factory, Safe_proxy_factory__factory } from '@/types/contracts'
import { type JsonRpcProvider } from 'ethers'
import { Multi_send__factory } from '@/types/contracts/factories/@safe-global/safe-deployments/dist/assets/v1.3.0'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'

describe('useSafeCreationData', () => {
  beforeAll(() => {
    jest.spyOn(sdk, 'getSafeProvider').mockReturnValue({
      getChainId: jest.fn().mockReturnValue('1'),
      getExternalProvider: jest.fn(),
      getExternalSigner: jest.fn(),
    } as unknown as SafeProvider)
  })
  it('should return undefined without chain info', async () => {
    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos: ChainInfo[] = []
    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos))
    await waitFor(async () => {
      await Promise.resolve()
      expect(result.current).toEqual([undefined, undefined, false])
    })
  })

  it('should return the replayedSafe when copying one', async () => {
    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos = [chainBuilder().with({ chainId: '1' }).build()]
    const undeployedSafe: UndeployedSafe = {
      props: {
        factoryAddress: faker.finance.ethereumAddress(),
        saltNonce: '420',
        masterCopy: faker.finance.ethereumAddress(),
        setupData: faker.string.hexadecimal({ length: 64 }),
      },
      status: {
        status: PendingSafeStatus.AWAITING_EXECUTION,
        type: PayMethod.PayLater,
      },
    }

    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos), {
      initialReduxState: {
        undeployedSafes: {
          '1': {
            [safeAddress]: undeployedSafe,
          },
        },
      },
    })
    await waitFor(async () => {
      await Promise.resolve()
      expect(result.current).toEqual([undeployedSafe.props, undefined, false])
    })
  })

  it('should ignore old predictedSafes', async () => {
    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos = [chainBuilder().with({ chainId: '1', l2: false }).build()]
    const undeployedSafe = {
      props: {
        safeAccountConfig: {
          owners: [faker.finance.ethereumAddress()],
          threshold: 1,
        },
        safeDeploymentConfig: {
          saltNonce: '69',
          safeVersion: '1.3.0',
        },
      },
      status: {
        status: PendingSafeStatus.AWAITING_EXECUTION,
        type: PayMethod.PayLater,
      },
    }

    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos), {
      initialReduxState: {
        undeployedSafes: {
          '1': {
            [safeAddress]: undeployedSafe as UndeployedSafe,
          },
        },
      },
    })

    await waitFor(async () => {
      await Promise.resolve()
      expect(result.current).toEqual([undefined, undefined, false])
    })
  })

  it('should throw error if creation data cannot be found', async () => {
    jest.spyOn(cgwSdk, 'getCreationTransaction').mockResolvedValue({
      response: new Response(),
      data: undefined,
    } as any)

    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos = [chainBuilder().with({ chainId: '1', l2: false }).build()]

    // Run hook
    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos))

    await waitFor(() => {
      expect(result.current).toEqual([undefined, new Error(SAFE_CREATION_DATA_ERRORS.NO_CREATION_DATA), false])
    })
  })

  it('should throw error if Safe creation data is incomplete', async () => {
    jest.spyOn(cgwSdk, 'getCreationTransaction').mockResolvedValue({
      data: {
        created: new Date(Date.now()).toISOString(),
        creator: faker.finance.ethereumAddress(),
        factoryAddress: faker.finance.ethereumAddress(),
        transactionHash: faker.string.hexadecimal({ length: 64 }),
        masterCopy: null,
        setupData: null,
      },
      response: new Response(),
    })

    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos = [chainBuilder().with({ chainId: '1', l2: false }).build()]

    // Run hook
    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos))

    await waitFor(() => {
      expect(result.current).toEqual([undefined, new Error(SAFE_CREATION_DATA_ERRORS.NO_CREATION_DATA), false])
    })
  })

  it('should throw error if RPC could not be created', async () => {
    const setupData = Safe__factory.createInterface().encodeFunctionData('setup', [
      [faker.finance.ethereumAddress(), faker.finance.ethereumAddress()],
      1,
      faker.finance.ethereumAddress(),
      faker.string.hexadecimal({ length: 64 }),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      0,
      faker.finance.ethereumAddress(),
    ])

    jest.spyOn(cgwSdk, 'getCreationTransaction').mockResolvedValue({
      data: {
        created: new Date(Date.now()).toISOString(),
        creator: faker.finance.ethereumAddress(),
        factoryAddress: faker.finance.ethereumAddress(),
        transactionHash: faker.string.hexadecimal({ length: 64 }),
        masterCopy: faker.finance.ethereumAddress(),
        setupData,
      },
      response: new Response(),
    })

    jest.spyOn(web3, 'createWeb3ReadOnly').mockReturnValue(undefined)

    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos = [chainBuilder().with({ chainId: '1', l2: false }).build()]

    // Run hook
    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos))

    await waitFor(() => {
      expect(result.current).toEqual([undefined, new Error(SAFE_CREATION_DATA_ERRORS.NO_PROVIDER), false])
    })
  })

  it('should throw error if RPC cannot find the tx hash', async () => {
    const setupData = Safe__factory.createInterface().encodeFunctionData('setup', [
      [faker.finance.ethereumAddress(), faker.finance.ethereumAddress()],
      1,
      faker.finance.ethereumAddress(),
      faker.string.hexadecimal({ length: 64 }),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      0,
      faker.finance.ethereumAddress(),
    ])

    const mockTxHash = faker.string.hexadecimal({ length: 64 })
    const mockFactoryAddress = faker.finance.ethereumAddress()
    const mockMasterCopyAddress = faker.finance.ethereumAddress()
    jest.spyOn(cgwSdk, 'getCreationTransaction').mockResolvedValue({
      data: {
        created: new Date(Date.now()).toISOString(),
        creator: faker.finance.ethereumAddress(),
        factoryAddress: mockFactoryAddress,
        transactionHash: mockTxHash,
        masterCopy: mockMasterCopyAddress,
        setupData,
      },
      response: new Response(),
    })

    jest.spyOn(web3, 'createWeb3ReadOnly').mockReturnValue({
      getTransaction: (txHash: string) => Promise.resolve(null),
    } as JsonRpcProvider)

    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos = [chainBuilder().with({ chainId: '1', l2: false }).build()]

    // Run hook
    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos))

    await waitFor(() => {
      expect(result.current).toEqual([undefined, new Error(SAFE_CREATION_DATA_ERRORS.TX_NOT_FOUND), false])
    })
  })

  it('should throw an Error if an unsupported creation method is found', async () => {
    const setupData = Safe__factory.createInterface().encodeFunctionData('setup', [
      [faker.finance.ethereumAddress(), faker.finance.ethereumAddress()],
      1,
      faker.finance.ethereumAddress(),
      faker.string.hexadecimal({ length: 64 }),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      0,
      faker.finance.ethereumAddress(),
    ])

    const mockTxHash = faker.string.hexadecimal({ length: 64 })
    const mockFactoryAddress = faker.finance.ethereumAddress()
    const mockMasterCopyAddress = faker.finance.ethereumAddress()
    jest.spyOn(cgwSdk, 'getCreationTransaction').mockResolvedValue({
      data: {
        created: new Date(Date.now()).toISOString(),
        creator: faker.finance.ethereumAddress(),
        factoryAddress: mockFactoryAddress,
        transactionHash: mockTxHash,
        masterCopy: mockMasterCopyAddress,
        setupData,
      },
      response: new Response(),
    })

    jest.spyOn(web3, 'createWeb3ReadOnly').mockReturnValue({
      getTransaction: (txHash: string) => {
        if (mockTxHash === txHash) {
          return Promise.resolve({
            to: mockFactoryAddress,
            data: Safe_proxy_factory__factory.createInterface().encodeFunctionData('createProxyWithCallback', [
              mockMasterCopyAddress,
              setupData,
              69,
              faker.finance.ethereumAddress(),
            ]),
          })
        }
      },
    } as JsonRpcProvider)

    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos = [chainBuilder().with({ chainId: '1', l2: false }).build()]

    // Run hook
    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos))

    await waitFor(() => {
      expect(result.current).toEqual([undefined, new Error(SAFE_CREATION_DATA_ERRORS.UNSUPPORTED_SAFE_CREATION), false])
    })
  })

  it('should throw error if the setup data does not match', async () => {
    const setupData = Safe__factory.createInterface().encodeFunctionData('setup', [
      [faker.finance.ethereumAddress(), faker.finance.ethereumAddress()],
      1,
      faker.finance.ethereumAddress(),
      faker.string.hexadecimal({ length: 64 }),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      0,
      faker.finance.ethereumAddress(),
    ])

    const nonMatchingSetupData = Safe__factory.createInterface().encodeFunctionData('setup', [
      [faker.finance.ethereumAddress(), faker.finance.ethereumAddress()],
      1,
      faker.finance.ethereumAddress(),
      faker.string.hexadecimal({ length: 64 }),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      0,
      faker.finance.ethereumAddress(),
    ])

    const mockTxHash = faker.string.hexadecimal({ length: 64 })
    const mockFactoryAddress = faker.finance.ethereumAddress()
    const mockMasterCopyAddress = faker.finance.ethereumAddress()
    jest.spyOn(cgwSdk, 'getCreationTransaction').mockResolvedValue({
      data: {
        created: new Date(Date.now()).toISOString(),
        creator: faker.finance.ethereumAddress(),
        factoryAddress: mockFactoryAddress,
        transactionHash: mockTxHash,
        masterCopy: mockMasterCopyAddress,
        setupData,
      },
      response: new Response(),
    })

    jest.spyOn(web3, 'createWeb3ReadOnly').mockReturnValue({
      getTransaction: (txHash: string) => {
        if (mockTxHash === txHash) {
          return Promise.resolve({
            to: mockFactoryAddress,
            data: Safe_proxy_factory__factory.createInterface().encodeFunctionData('createProxyWithNonce', [
              mockMasterCopyAddress,
              nonMatchingSetupData,
              69,
            ]),
          })
        }
        return Promise.resolve(null)
      },
    } as JsonRpcProvider)

    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos = [chainBuilder().with({ chainId: '1', l2: false }).build()]

    // Run hook
    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos))

    await waitFor(() => {
      expect(result.current).toEqual([undefined, new Error(SAFE_CREATION_DATA_ERRORS.UNSUPPORTED_SAFE_CREATION), false])
    })
  })

  it('should throw error if the masterCopies do not match', async () => {
    const setupData = Safe__factory.createInterface().encodeFunctionData('setup', [
      [faker.finance.ethereumAddress(), faker.finance.ethereumAddress()],
      1,
      faker.finance.ethereumAddress(),
      faker.string.hexadecimal({ length: 64 }),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      0,
      faker.finance.ethereumAddress(),
    ])

    const mockTxHash = faker.string.hexadecimal({ length: 64 })
    const mockFactoryAddress = faker.finance.ethereumAddress()
    const mockMasterCopyAddress = faker.finance.ethereumAddress()
    jest.spyOn(cgwSdk, 'getCreationTransaction').mockResolvedValue({
      data: {
        created: new Date(Date.now()).toISOString(),
        creator: faker.finance.ethereumAddress(),
        factoryAddress: mockFactoryAddress,
        transactionHash: mockTxHash,
        masterCopy: mockMasterCopyAddress,
        setupData,
      },
      response: new Response(),
    })

    jest.spyOn(web3, 'createWeb3ReadOnly').mockReturnValue({
      getTransaction: (txHash: string) => {
        if (mockTxHash === txHash) {
          return Promise.resolve({
            to: mockFactoryAddress,
            data: Safe_proxy_factory__factory.createInterface().encodeFunctionData('createProxyWithNonce', [
              faker.finance.ethereumAddress(),
              setupData,
              69,
            ]),
          })
        }
        return Promise.resolve(null)
      },
    } as JsonRpcProvider)

    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos = [chainBuilder().with({ chainId: '1', l2: false }).build()]

    // Run hook
    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos))

    await waitFor(() => {
      expect(result.current).toEqual([undefined, new Error(SAFE_CREATION_DATA_ERRORS.UNSUPPORTED_SAFE_CREATION), false])
    })
  })

  it('should return transaction data for direct Safe creation txs', async () => {
    const setupData = Safe__factory.createInterface().encodeFunctionData('setup', [
      [faker.finance.ethereumAddress(), faker.finance.ethereumAddress()],
      1,
      faker.finance.ethereumAddress(),
      faker.string.hexadecimal({ length: 64 }),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      0,
      faker.finance.ethereumAddress(),
    ])

    const mockTxHash = faker.string.hexadecimal({ length: 64 })
    const mockFactoryAddress = faker.finance.ethereumAddress()
    const mockMasterCopyAddress = faker.finance.ethereumAddress()
    jest.spyOn(cgwSdk, 'getCreationTransaction').mockResolvedValue({
      data: {
        created: new Date(Date.now()).toISOString(),
        creator: faker.finance.ethereumAddress(),
        factoryAddress: mockFactoryAddress,
        transactionHash: mockTxHash,
        masterCopy: mockMasterCopyAddress,
        setupData,
      },
      response: new Response(),
    })

    jest.spyOn(web3, 'createWeb3ReadOnly').mockReturnValue({
      getTransaction: (txHash: string) => {
        if (mockTxHash === txHash) {
          return Promise.resolve({
            to: mockFactoryAddress,
            data: Safe_proxy_factory__factory.createInterface().encodeFunctionData('createProxyWithNonce', [
              mockMasterCopyAddress,
              setupData,
              69,
            ]),
          })
        }
        return Promise.resolve(null)
      },
    } as JsonRpcProvider)

    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos = [chainBuilder().with({ chainId: '1', l2: false }).build()]

    // Run hook
    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos))

    await waitFor(() => {
      expect(result.current).toEqual([
        {
          factoryAddress: mockFactoryAddress,
          masterCopy: mockMasterCopyAddress,
          setupData,
          saltNonce: '69',
        },
        undefined,
        false,
      ])
    })
  })

  it('should return transaction data for creation bundles', async () => {
    const setupData = Safe__factory.createInterface().encodeFunctionData('setup', [
      [faker.finance.ethereumAddress(), faker.finance.ethereumAddress()],
      1,
      faker.finance.ethereumAddress(),
      faker.string.hexadecimal({ length: 64 }),
      faker.finance.ethereumAddress(),
      faker.finance.ethereumAddress(),
      0,
      faker.finance.ethereumAddress(),
    ])

    const mockTxHash = faker.string.hexadecimal({ length: 64 })
    const mockFactoryAddress = faker.finance.ethereumAddress()
    const mockMasterCopyAddress = faker.finance.ethereumAddress()

    jest.spyOn(cgwSdk, 'getCreationTransaction').mockResolvedValue({
      data: {
        created: new Date(Date.now()).toISOString(),
        creator: faker.finance.ethereumAddress(),
        factoryAddress: mockFactoryAddress,
        transactionHash: mockTxHash,
        masterCopy: mockMasterCopyAddress,
        setupData,
      },
      response: new Response(),
    })

    jest.spyOn(web3, 'createWeb3ReadOnly').mockReturnValue({
      getTransaction: (txHash: string) => {
        if (txHash === mockTxHash) {
          const deploymentTx = {
            to: mockFactoryAddress,
            data: Safe_proxy_factory__factory.createInterface().encodeFunctionData('createProxyWithNonce', [
              mockMasterCopyAddress,
              setupData,
              69,
            ]),
            value: '0',
            operation: 0,
          }
          const someOtherTx = {
            to: faker.finance.ethereumAddress(),
            value: '0',
            operation: 0,
            data: faker.string.hexadecimal({ length: 64 }),
          }

          const multiSendData = encodeMultiSendData([deploymentTx, someOtherTx])
          return Promise.resolve({
            to: faker.finance.ethereumAddress(),
            data: Multi_send__factory.createInterface().encodeFunctionData('multiSend', [multiSendData]),
          })
        }
        return Promise.resolve(null)
      },
    } as JsonRpcProvider)

    const safeAddress = faker.finance.ethereumAddress()
    const chainInfos = [chainBuilder().with({ chainId: '1', l2: false }).build()]

    // Run hook
    const { result } = renderHook(() => useSafeCreationData(safeAddress, chainInfos))

    await waitFor(() => {
      expect(result.current).toEqual([
        {
          factoryAddress: mockFactoryAddress,
          masterCopy: mockMasterCopyAddress,
          setupData,
          saltNonce: '69',
        },
        undefined,
        false,
      ])
    })
  })
})
