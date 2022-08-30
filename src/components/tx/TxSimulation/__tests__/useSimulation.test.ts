import { ZERO_ADDRESS } from '@gnosis.pm/safe-core-sdk/dist/src/utils/constants'

import { act, renderHook, waitFor } from '@/tests/test-utils'
import { useSimulation } from '@/components/tx/TxSimulation/useSimulation'
import { FETCH_STATUS, type TenderlySimulation } from '@/components/tx/TxSimulation/types'

const setupFetchStub = (data: any) => (_url: string) => {
  return new Promise((resolve) => {
    resolve({
      json: () => Promise.resolve(data),
    })
  })
}

describe('useSimulation()', () => {
  afterEach(() => {
    //@ts-ignore
    global.fetch?.mockClear()
  })

  afterAll(() => {
    // @ts-ignore
    delete global.fetch
  })

  it('should have the correct initital values', () => {
    const { result } = renderHook(() => useSimulation())
    const { simulation, simulationLink, requestError: simulationError, simulationRequestStatus } = result.current

    expect(simulation).toBeUndefined()
    expect(simulationLink).not.toBeUndefined()
    expect(simulationError).toBeUndefined()
    expect(simulationRequestStatus).toEqual(FETCH_STATUS.NOT_ASKED)
  })

  it('should set simulationError on errors and errors can be reset.', async () => {
    global.fetch = jest.fn()

    const mockFetch = jest.spyOn(global, 'fetch')
    mockFetch.mockImplementation(() => Promise.reject({ message: '404 not found' }))
    const { result } = renderHook(() => useSimulation())
    const { simulateTransaction } = result.current

    await act(async () =>
      simulateTransaction({
        tx: { data: '0x123', to: ZERO_ADDRESS },
        chainId: '4',
        safeAddress: '0x57CB13cbef735FbDD65f5f2866638c546464E45F',
        walletAddress: '0x57CB13cbef735FbDD65f5f2866638c546464E45E',
        canExecute: true,
        gasLimit: 200_000,
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

    const { result } = renderHook(() => useSimulation())
    const { simulateTransaction } = result.current

    await act(async () =>
      simulateTransaction({
        tx: { data: '0x123', to: ZERO_ADDRESS },
        chainId: '4',
        safeAddress,
        walletAddress: '0x57CB13cbef735FbDD65f5f2866638c546464E45E',
        canExecute: true,
        gasLimit: 200_000,
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

    const { result } = renderHook(() => useSimulation())
    const { simulateTransaction } = result.current

    await act(async () =>
      simulateTransaction({
        tx: { data: '0x123', to: ZERO_ADDRESS },
        chainId: '4',
        safeAddress,
        walletAddress: '0x57CB13cbef735FbDD65f5f2866638c546464E45E',
        canExecute: false,
        gasLimit: 200_000,
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
