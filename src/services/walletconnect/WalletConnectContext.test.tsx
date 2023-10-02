import { hexZeroPad } from 'ethers/lib/utils'
import { useContext } from 'react'
import type { SafeInfo } from '@safe-global/safe-gateway-typescript-sdk'

import { fireEvent, render, waitFor } from '@/tests/test-utils'
import { WalletConnectContext, WalletConnectProvider } from './WalletConnectContext'
import WalletConnectWallet from './WalletConnectWallet'
import { safeInfoSlice } from '@/store/safeInfoSlice'
import { useAppDispatch } from '@/store'

jest.mock('./WalletConnectWallet')

const TestComponent = () => {
  const { walletConnect, error } = useContext(WalletConnectContext)
  return (
    <>
      {walletConnect && <p>WalletConnect initialized</p>}
      {error && <p>{error.message}</p>}
    </>
  )
}

describe('WalletConnectProvider', () => {
  it('sets the walletConnect state', async () => {
    jest.spyOn(WalletConnectWallet, 'init').mockImplementation(() => Promise.resolve())
    jest.spyOn(WalletConnectWallet, 'updateSessions').mockImplementation(() => Promise.resolve())

    const { getByText } = render(
      <WalletConnectProvider>
        <TestComponent />
      </WalletConnectProvider>,
      {
        initialReduxState: {
          safeInfo: {
            loading: false,
            data: {
              address: {
                value: hexZeroPad('0x123', 20),
              },
              chainId: '5',
            } as SafeInfo,
          },
        },
      },
    )

    await waitFor(() => {
      expect(getByText('WalletConnect initialized')).toBeInTheDocument()
    })
  })

  it('sets the error state', async () => {
    jest.spyOn(WalletConnectWallet, 'init').mockImplementation(() => Promise.reject(new Error('Test init failed')))
    jest.spyOn(WalletConnectWallet, 'updateSessions').mockImplementation(() => Promise.resolve())

    const { getByText } = render(
      <WalletConnectProvider>
        <TestComponent />
      </WalletConnectProvider>,
      {
        initialReduxState: {
          safeInfo: {
            loading: false,
            data: {
              address: {
                value: hexZeroPad('0x123', 20),
              },
              chainId: '5',
            } as SafeInfo,
          },
        },
      },
    )

    await waitFor(() => {
      expect(getByText('Test init failed')).toBeInTheDocument()
    })
  })

  describe('updateSessions', () => {
    const getUpdateSafeInfoComponent = (safeInfo: SafeInfo) => {
      // eslint-disable-next-line react/display-name
      return () => {
        const dispatch = useAppDispatch()
        const updateSafeInfo = () => {
          dispatch(
            safeInfoSlice.actions.set({
              loading: false,
              data: safeInfo,
            }),
          )
        }

        return <button onClick={() => updateSafeInfo()}>update</button>
      }
    }

    it('updates sessions when the chainId changes', async () => {
      jest.spyOn(WalletConnectWallet, 'init').mockImplementation(() => Promise.resolve())
      jest.spyOn(WalletConnectWallet, 'updateSessions').mockImplementation(() => Promise.resolve())

      const ChainUpdater = getUpdateSafeInfoComponent({
        address: { value: hexZeroPad('0x123', 20) },
        chainId: '1',
      } as SafeInfo)

      const { getByText } = render(
        <WalletConnectProvider>
          <TestComponent />
          <ChainUpdater />
        </WalletConnectProvider>,
        {
          initialReduxState: {
            safeInfo: {
              loading: false,
              data: {
                address: {
                  value: hexZeroPad('0x123', 20),
                },
                chainId: '5',
              } as SafeInfo,
            },
          },
        },
      )

      await waitFor(() => {
        expect(getByText('WalletConnect initialized')).toBeInTheDocument()
        expect(WalletConnectWallet.updateSessions).toHaveBeenCalledWith('5', hexZeroPad('0x123', 20))
      })

      fireEvent.click(getByText('update'))

      await waitFor(() => {
        expect(WalletConnectWallet.updateSessions).toHaveBeenCalledWith('1', hexZeroPad('0x123', 20))
      })
    })

    it('updates sessions when the safeAddress changes', async () => {
      jest.spyOn(WalletConnectWallet, 'init').mockImplementation(() => Promise.resolve())
      jest.spyOn(WalletConnectWallet, 'updateSessions').mockImplementation(() => Promise.resolve())

      const AddressUpdater = getUpdateSafeInfoComponent({
        address: { value: hexZeroPad('0x456', 20) },
        chainId: '5',
      } as SafeInfo)

      const { getByText } = render(
        <WalletConnectProvider>
          <TestComponent />
          <AddressUpdater />
        </WalletConnectProvider>,
        {
          initialReduxState: {
            safeInfo: {
              loading: false,
              data: {
                address: {
                  value: hexZeroPad('0x123', 20),
                },
                chainId: '5',
              } as SafeInfo,
            },
          },
        },
      )

      await waitFor(() => {
        expect(getByText('WalletConnect initialized')).toBeInTheDocument()
        expect(WalletConnectWallet.updateSessions).toHaveBeenCalledWith('5', hexZeroPad('0x123', 20))
      })

      fireEvent.click(getByText('update'))

      await waitFor(() => {
        expect(WalletConnectWallet.updateSessions).toHaveBeenCalledWith('5', hexZeroPad('0x456', 20))
      })
    })

    it('sets the error state', async () => {
      jest.spyOn(WalletConnectWallet, 'init').mockImplementation(() => Promise.resolve())
      jest
        .spyOn(WalletConnectWallet, 'updateSessions')
        .mockImplementation(() => Promise.reject(new Error('Test updateSessions failed')))

      const { getByText } = render(
        <WalletConnectProvider>
          <TestComponent />
        </WalletConnectProvider>,
        {
          initialReduxState: {
            safeInfo: {
              loading: false,
              data: {
                address: {
                  value: hexZeroPad('0x123', 20),
                },
                chainId: '5',
              } as SafeInfo,
            },
          },
        },
      )

      await waitFor(() => {
        expect(getByText('Test updateSessions failed')).toBeInTheDocument()
      })
    })
  })

  describe('onRequest', () => {
    it.todo('does not continue with the request if there is no matching topic')

    it.todo('does not continue with the request if there is no matching chainId')

    it.todo('passes the request onto the Safe Wallet Provider and sends the response to WalletConnect')

    it.todo('sets the error state if there is an error requesting the response from the Safe Wallet Provider')
  })
})
