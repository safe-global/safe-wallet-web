import { renderHook, waitFor } from '@/tests/test-utils'
import { WalletConnectContext } from '@/features/walletconnect/WalletConnectContext'
import useWalletConnectSessions from '../useWalletConnectSessions'
import type WalletConnectWallet from '../../services/WalletConnectWallet'

describe('useWalletConnectSessions', () => {
  it('should return an array of active sessions', () => {
    const sessions = [
      {
        topic: 'topic1',
        chainId: 1,
        key: 'key1',
        metadata: {
          name: 'session1',
        },
      },
      {
        topic: 'topic2',
        chainId: 1,
        key: 'key2',
        metadata: {
          name: 'session2',
        },
      },
    ]

    const mockWalletConnect = {
      getActiveSessions: jest.fn().mockReturnValue(sessions),
      onSessionAdd: jest.fn(),
      onSessionDelete: jest.fn(),
    } as unknown as WalletConnectWallet

    const wrapper = ({ children }: any) => (
      <WalletConnectContext.Provider
        value={{
          walletConnect: mockWalletConnect,
          error: null,
          setError: () => {},
          open: false,
          setOpen: () => {},
          isLoading: undefined,
          setIsLoading: () => {},
        }}
      >
        {children}
      </WalletConnectContext.Provider>
    )

    const { result } = renderHook(() => useWalletConnectSessions(), { wrapper })

    expect(result.current).toEqual(sessions)
  })

  it('should update sessions when a session is added', async () => {
    const mockWalletConnect = {
      getActiveSessions: jest.fn().mockReturnValue([]),
      onSessionAdd: jest.fn(),
      onSessionDelete: jest.fn(),
    } as unknown as WalletConnectWallet

    const wrapper = ({ children }: any) => (
      <WalletConnectContext.Provider
        value={{
          walletConnect: mockWalletConnect,
          error: null,
          setError: () => {},
          open: false,
          setOpen: () => {},
          isLoading: undefined,
          setIsLoading: () => {},
        }}
      >
        {children}
      </WalletConnectContext.Provider>
    )

    const { result } = renderHook(() => useWalletConnectSessions(), { wrapper })

    expect(result.current).toEqual([])

    const updateSessions = (mockWalletConnect.onSessionAdd as jest.Mock).mock.calls[0][0]

    ;(mockWalletConnect.getActiveSessions as jest.Mock).mockReturnValue([
      {
        topic: 'topic1',
        chainId: 1,
        key: 'key1',
        metadata: {
          name: 'session1',
        },
      },
    ])

    updateSessions()

    expect(mockWalletConnect.getActiveSessions).toHaveBeenCalled()

    await waitFor(() => {
      expect(result.current).toEqual([
        {
          topic: 'topic1',
          chainId: 1,
          key: 'key1',
          metadata: {
            name: 'session1',
          },
        },
      ])
    })
  })

  it('should update sessions when a session is deleted', async () => {
    const mockWalletConnect = {
      getActiveSessions: jest.fn().mockReturnValue([]),
      onSessionAdd: jest.fn(),
      onSessionDelete: jest.fn(),
    } as unknown as WalletConnectWallet

    const wrapper = ({ children }: any) => (
      <WalletConnectContext.Provider
        value={{
          walletConnect: mockWalletConnect,
          error: null,
          setError: () => {},
          open: false,
          setOpen: () => {},
          isLoading: undefined,
          setIsLoading: () => {},
        }}
      >
        {children}
      </WalletConnectContext.Provider>
    )

    const { result } = renderHook(() => useWalletConnectSessions(), { wrapper })

    expect(result.current).toEqual([])

    const updateSessions = (mockWalletConnect.onSessionDelete as jest.Mock).mock.calls[0][0]

    ;(mockWalletConnect.getActiveSessions as jest.Mock).mockReturnValue([
      {
        topic: 'topic1',
        chainId: 1,
        key: 'key1',
        metadata: {
          name: 'session1',
        },
      },
    ])

    updateSessions()

    expect(mockWalletConnect.getActiveSessions).toHaveBeenCalled()

    await waitFor(() => {
      expect(result.current).toEqual([
        {
          topic: 'topic1',
          chainId: 1,
          key: 'key1',
          metadata: {
            name: 'session1',
          },
        },
      ])
    })
  })
})
