import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { act, renderHook, waitFor } from '@/tests/test-utils'
import { useSimulation } from '@/components/tx/TxSimulation/useSimulation'
import * as utils from '@/components/tx/TxSimulation/utils'
import { FETCH_STATUS, type TenderlySimulation } from '@/components/tx/TxSimulation/types'

const setupFetchStub = (data: any) => (_url: string) => {
  return Promise.resolve({
    json: () => Promise.resolve(data),
    status: 200,
    ok: true,
  })
}

describe('useSimulation()', () => {
  afterEach(() => {
    //@ts-ignore
    global.fetch?.mockClear?.()
  })

  afterAll(() => {
    // @ts-ignore
    delete global.fetch
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should have the correct initial values', () => {
    const { result } = renderHook(() => useSimulation())
    const { simulation, simulationLink, requestError: simulationError, simulationRequestStatus } = result.current

    expect(simulation).toBeUndefined()
    expect(simulationLink).not.toBeUndefined()
    expect(simulationError).toBeUndefined()
    expect(simulationRequestStatus).toEqual(FETCH_STATUS.NOT_ASKED)
  })

  it('should set simulationError on errors and errors can be reset.', async () => {
    const safeAddress = '0x57CB13cbef735FbDD65f5f2866638c546464E45F'
    const chainId = '4'

    global.fetch = jest.fn()

    const mockFetch = jest.spyOn(global, 'fetch')

    mockFetch.mockImplementation(() => Promise.reject({ message: '404 not found' }))

    jest.spyOn(utils, 'getSimulationPayload').mockImplementation(() =>
      Promise.resolve({
        input: '0x123',
        to: '0x123',
        network_id: chainId,
        from: safeAddress,
        gas: 0,
        // With gas price 0 account don't need token for gas
        gas_price: '0',
        state_objects: {
          [safeAddress]: {
            balance: '0x123',
          },
        },
        save: true,
        save_if_fails: true,
      }),
    )

    const { result } = renderHook(() => useSimulation())
    const { simulateTransaction } = result.current

    await act(async () =>
      simulateTransaction({
        transactions: [],
        safe: {
          address: {
            value: safeAddress,
          },
          chainId,
        } as SafeInfo,
        executionOwner: safeAddress,
        canExecute: true,
      }),
    )

    await waitFor(() => {
      const { simulationRequestStatus, requestError: simulationError } = result.current
      expect(simulationRequestStatus).toEqual(FETCH_STATUS.ERROR)
      expect(simulationError).toEqual('404 not found')
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      result.current.resetSimulation()
    })

    expect(result.current.simulationRequestStatus).toEqual(FETCH_STATUS.NOT_ASKED)
    expect(result.current.requestError).toBeUndefined()
  })

  it('should set simulation for executable transaction on success and simulation can be reset.', async () => {
    const safeAddress = '0x57CB13cbef735FbDD65f5f2866638c546464E45F'
    const chainId = '4'

    const mockAnswer: TenderlySimulation = {
      contracts: [],
      generated_access_list: [],
      transaction: {},
      simulation: {
        status: true,
        id: '123',
      },
    } as any as TenderlySimulation

    global.fetch = jest.fn().mockImplementation(setupFetchStub(mockAnswer))

    const mockFetch = jest.spyOn(global, 'fetch')

    jest.spyOn(utils, 'getSimulationPayload').mockImplementation(() =>
      Promise.resolve({
        input: '0x123',
        to: '0x123',
        network_id: chainId,
        from: safeAddress,
        gas: 0,
        // With gas price 0 account don't need token for gas
        gas_price: '0',
        state_objects: {
          [safeAddress]: {
            balance: '0x123',
          },
        },
        save: true,
        save_if_fails: true,
      }),
    )

    const { result } = renderHook(() => useSimulation())
    const { simulateTransaction } = result.current

    await act(async () =>
      simulateTransaction({
        transactions: [],
        safe: {
          address: {
            value: safeAddress,
          },
          chainId,
        } as SafeInfo,
        executionOwner: safeAddress,
        canExecute: true,
      }),
    )

    await waitFor(() => {
      const { simulationRequestStatus, simulation } = result.current
      expect(simulationRequestStatus).toEqual(FETCH_STATUS.SUCCESS)
      expect(simulation?.simulation.status).toBeTruthy()
      expect(simulation?.simulation.id).toEqual('123')
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)

    await act(async () => {
      result.current.resetSimulation()
    })

    expect(result.current.simulationRequestStatus).toEqual(FETCH_STATUS.NOT_ASKED)
    expect(result.current.simulation).toBeUndefined()
  })

  it('should set simulation for not-executable transaction on success', async () => {
    const safeAddress = '0x57CB13cbef735FbDD65f5f2866638c546464E45F'
    const chainId = '4'

    const mockAnswer: TenderlySimulation = {
      contracts: [],
      generated_access_list: [],
      transaction: {},
      simulation: {
        status: true,
        id: '123',
      },
    } as any as TenderlySimulation

    global.fetch = jest.fn().mockImplementation(setupFetchStub(mockAnswer))

    const mockFetch = jest.spyOn(global, 'fetch')

    jest.spyOn(utils, 'getSimulationPayload').mockImplementation(() =>
      Promise.resolve({
        input: '0x123',
        to: '0x123',
        network_id: chainId,
        from: safeAddress,
        gas: 0,
        // With gas price 0 account don't need token for gas
        gas_price: '0',
        state_objects: {
          [safeAddress]: {
            balance: '0x123',
          },
        },
        save: true,
        save_if_fails: true,
      }),
    )

    const { result } = renderHook(() => useSimulation())
    const { simulateTransaction } = result.current

    await act(async () =>
      simulateTransaction({
        transactions: [],
        safe: {
          address: {
            value: safeAddress,
          },
          chainId,
        } as SafeInfo,
        executionOwner: safeAddress,
        canExecute: false,
      }),
    )

    await waitFor(() => {
      const { simulationRequestStatus, simulation } = result.current
      expect(simulationRequestStatus).toEqual(FETCH_STATUS.SUCCESS)
      expect(simulation?.simulation.status).toBeTruthy()
      expect(simulation?.simulation.id).toEqual('123')
    })

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })
})
