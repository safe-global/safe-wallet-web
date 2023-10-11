import { act, render, waitFor } from '@/tests/test-utils'
import * as useWallet from '@/hooks/wallets/useWallet'
import * as useMPCWallet from '@/hooks/wallets/mpc/useMPCWallet'
import MPCLogin from '../MPCLogin'
import { hexZeroPad } from '@ethersproject/bytes'
import { type EIP1193Provider } from '@web3-onboard/common'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/module'
import { MpcWalletProvider } from '../MPCWalletProvider'

describe('MPCLogin', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should render continue with connected account', async () => {
    const mockOnLogin = jest.fn()
    const walletAddress = hexZeroPad('0x1', 20)
    jest.spyOn(useWallet, 'default').mockReturnValue({
      address: walletAddress,
      chainId: '5',
      label: ONBOARD_MPC_MODULE_LABEL,
      provider: {} as unknown as EIP1193Provider,
    })
    jest.spyOn(useMPCWallet, 'useMPCWallet').mockReturnValue({
      userInfo: {
        email: 'test@safe.test',
        name: 'Test Testermann',
        profileImage: 'test.png',
      },
      triggerLogin: jest.fn(),
      walletState: useMPCWallet.MPCWalletState.READY,
    } as unknown as useMPCWallet.MPCWalletHook)

    const result = render(
      <MpcWalletProvider>
        <MPCLogin onLogin={mockOnLogin} />
      </MpcWalletProvider>,
    )

    await waitFor(() => {
      expect(result.findByText('Continue as Test Testermann')).resolves.toBeDefined()
    })

    // We do not automatically invoke the callback as the user did not actively connect
    expect(mockOnLogin).not.toHaveBeenCalled()

    const button = await result.findByRole('button')
    button.click()

    expect(mockOnLogin).toHaveBeenCalled()
  })

  it('should render google login button and invoke the callback on connection if no wallet is connected', async () => {
    const mockOnLogin = jest.fn()
    const walletAddress = hexZeroPad('0x1', 20)
    const mockUseWallet = jest.spyOn(useWallet, 'default').mockReturnValue(null)
    const mockTriggerLogin = jest.fn(() => true)
    const mockUseMPCWallet = jest.spyOn(useMPCWallet, 'useMPCWallet').mockReturnValue({
      userInfo: {
        email: undefined,
        name: undefined,
        profileImage: undefined,
      },
      triggerLogin: mockTriggerLogin,
      walletState: useMPCWallet.MPCWalletState.NOT_INITIALIZED,
    } as unknown as useMPCWallet.MPCWalletHook)

    const result = render(
      <MpcWalletProvider>
        <MPCLogin onLogin={mockOnLogin} />
      </MpcWalletProvider>,
    )

    await waitFor(() => {
      expect(result.findByText('Continue with Google')).resolves.toBeDefined()
    })

    // We do not automatically invoke the callback as the user did not actively connect
    expect(mockOnLogin).not.toHaveBeenCalled()

    await act(async () => {
      // Click the button and mock a successful login
      const button = await result.findByRole('button')
      button.click()
      mockUseMPCWallet.mockReset().mockReturnValue({
        userInfo: {
          email: 'test@safe.test',
          name: 'Test Testermann',
          profileImage: 'test.png',
        },
        triggerLogin: jest.fn(),
        walletState: useMPCWallet.MPCWalletState.READY,
      } as unknown as useMPCWallet.MPCWalletHook)

      mockUseWallet.mockReset().mockReturnValue({
        address: walletAddress,
        chainId: '5',
        label: ONBOARD_MPC_MODULE_LABEL,
        provider: {} as unknown as EIP1193Provider,
      })
    })

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled()
    })
  })
})
