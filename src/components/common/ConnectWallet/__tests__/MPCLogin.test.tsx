import { act, fireEvent, render, waitFor } from '@/tests/test-utils'
import * as useWallet from '@/hooks/wallets/useWallet'
import * as useMPCWallet from '@/hooks/wallets/mpc/useMPCWallet'
import * as chains from '@/hooks/useChains'

import MPCLogin, { _getSupportedChains } from '../MPCLogin'
import { hexZeroPad } from '@ethersproject/bytes'
import { type EIP1193Provider } from '@web3-onboard/common'
import { ONBOARD_MPC_MODULE_LABEL } from '@/services/mpc/SocialLoginModule'
import { MpcWalletProvider } from '../MPCWalletProvider'
import { type ChainInfo } from '@safe-global/safe-gateway-typescript-sdk'
import { COREKIT_STATUS } from '@web3auth/mpc-core-kit'

jest.mock('@/services/mpc/SocialWalletService')

describe('MPCLogin', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should render continue with connected account when on gnosis chain', async () => {
    const mockOnLogin = jest.fn()
    const walletAddress = hexZeroPad('0x1', 20)
    jest
      .spyOn(chains, 'useCurrentChain')
      .mockReturnValue({ chainId: '100', disabledWallets: [] } as unknown as ChainInfo)
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

  it('should render google login button and invoke the callback on connection if no wallet is connected on gnosis chain', async () => {
    const mockOnLogin = jest.fn()
    jest
      .spyOn(chains, 'useCurrentChain')
      .mockReturnValue({ chainId: '100', disabledWallets: [] } as unknown as ChainInfo)
    jest.spyOn(useWallet, 'default').mockReturnValue(null)
    const mockTriggerLogin = jest.fn(() => COREKIT_STATUS.LOGGED_IN)
    jest.spyOn(useMPCWallet, 'useMPCWallet').mockReturnValue({
      triggerLogin: mockTriggerLogin,
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

    const button = await result.findByRole('button')
    button.click()

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled()
    })
  })

  it('should disable the Google Login button with a message when not on gnosis chain', async () => {
    const mockEthereumChain = { chainId: '1', chainName: 'Ethereum', disabledWallets: ['socialLogin'] } as ChainInfo
    const mockGoerliChain = { chainId: '5', chainName: 'Goerli', disabledWallets: ['TallyHo'] } as ChainInfo

    jest
      .spyOn(chains, 'useCurrentChain')
      .mockReturnValue({ chainId: '1', disabledWallets: ['socialLogin'] } as unknown as ChainInfo)
    jest.spyOn(chains, 'default').mockReturnValue({ configs: [mockEthereumChain, mockGoerliChain] })
    jest.spyOn(useMPCWallet, 'useMPCWallet').mockReturnValue({
      triggerLogin: jest.fn(),
    } as unknown as useMPCWallet.MPCWalletHook)

    const result = render(
      <MpcWalletProvider>
        <MPCLogin />
      </MpcWalletProvider>,
    )

    expect(result.getByText('Currently only supported on Goerli')).toBeInTheDocument()
    expect(await result.findByRole('button')).toBeDisabled()
  })

  it('should display Password Recovery and recover with correct password', async () => {
    const mockOnLogin = jest.fn()
    jest
      .spyOn(chains, 'useCurrentChain')
      .mockReturnValue({ chainId: '100', disabledWallets: [] } as unknown as ChainInfo)
    jest.spyOn(useWallet, 'default').mockReturnValue(null)
    const mockTriggerLogin = jest.fn(() => COREKIT_STATUS.REQUIRED_SHARE)
    jest.spyOn(useMPCWallet, 'useMPCWallet').mockReturnValue({
      triggerLogin: mockTriggerLogin,
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

    const button = await result.findByRole('button')
    act(() => {
      button.click()
    })

    await waitFor(() => {
      expect(result.findByText('Enter security password')).resolves.toBeDefined()
    })

    const passwordField = await result.findByLabelText('Recovery password')
    const submitButton = await result.findByText('Submit')

    act(() => {
      fireEvent.change(passwordField, { target: { value: 'Test1234!' } })
      submitButton.click()
    })

    await waitFor(() => {
      expect(mockOnLogin).toHaveBeenCalled()
    })
  })

  it('should display Password Recovery and not recover with wrong password', async () => {
    const mockOnLogin = jest.fn()
    jest
      .spyOn(chains, 'useCurrentChain')
      .mockReturnValue({ chainId: '100', disabledWallets: [] } as unknown as ChainInfo)
    jest.spyOn(useWallet, 'default').mockReturnValue(null)
    const mockTriggerLogin = jest.fn(() => COREKIT_STATUS.REQUIRED_SHARE)
    jest.spyOn(useMPCWallet, 'useMPCWallet').mockReturnValue({
      triggerLogin: mockTriggerLogin,
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

    const button = await result.findByRole('button')
    act(() => {
      button.click()
    })

    await waitFor(() => {
      expect(result.findByText('Enter security password')).resolves.toBeDefined()
    })

    const passwordField = await result.findByLabelText('Recovery password')
    const submitButton = await result.findByText('Submit')

    act(() => {
      fireEvent.change(passwordField, { target: { value: 'Invalid password' } })
      submitButton.click()
    })

    await waitFor(() => {
      expect(mockOnLogin).not.toHaveBeenCalled()
      expect(result.findByText('Incorrect Password')).resolves.toBeDefined()
    })
  })

  describe('getSupportedChains', () => {
    it('returns chain names where social login is enabled', () => {
      const mockEthereumChain = { chainId: '1', chainName: 'Ethereum', disabledWallets: ['socialLogin'] } as ChainInfo
      const mockGnosisChain = { chainId: '100', chainName: 'Gnosis Chain', disabledWallets: ['Coinbase'] } as ChainInfo
      const mockGoerliChain = { chainId: '5', chainName: 'Goerli', disabledWallets: [] } as unknown as ChainInfo

      const mockChains = [mockEthereumChain, mockGnosisChain, mockGoerliChain]
      const result = _getSupportedChains(mockChains)

      expect(result).toEqual(['Gnosis Chain', 'Goerli'])
    })

    it('returns an empty array if social login is not enabled on any chain', () => {
      const mockEthereumChain = { chainId: '1', chainName: 'Ethereum', disabledWallets: ['socialLogin'] } as ChainInfo
      const mockGoerliChain = { chainId: '5', chainName: 'Goerli', disabledWallets: ['socialLogin'] } as ChainInfo

      const mockChains = [mockEthereumChain, mockGoerliChain]
      const result = _getSupportedChains(mockChains)

      expect(result).toEqual([])
    })
  })
})
