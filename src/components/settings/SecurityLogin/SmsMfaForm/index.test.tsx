import {
  getSocialWalletService,
  MultiFactorType,
  setMfaStore,
  __setSocialWalletService,
} from '@/hooks/wallets/mpc/useSocialWallet'
import { type ISocialWalletService } from '@/services/mpc/interfaces'
import SocialWalletService from '@/services/mpc/SocialWalletService'
import { act, fireEvent, render, typeInFocusedElement, waitFor } from '@/tests/test-utils'
import { type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'
import SmsMfaForm from '.'

jest.mock('@/services/mpc/SocialWalletService')

describe('SmsMfaForm', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })
  afterAll(() => {
    jest.useRealTimers()
  })
  beforeEach(() => {
    __setSocialWalletService(new SocialWalletService({} as Web3AuthMPCCoreKit))
    setMfaStore({ sms: undefined, password: undefined })
  })
  afterEach(() => {
    __setSocialWalletService(undefined)
  })
  it('should validate phone number', async () => {
    const result = render(<SmsMfaForm />)
    const phoneNumberInput = result.getByLabelText('Your phone number')
    expect(phoneNumberInput).toBeEnabled()

    await act(() => fireEvent.change(phoneNumberInput, { target: { value: 'invalid number' } }))

    await waitFor(() => {
      expect(phoneNumberInput).toBeInvalid()
      expect(result.getByText('Invalid phone number')).toBeDefined()
      expect(result.getByText('Setup SMS factor')).toBeDisabled()
    })

    await act(() => fireEvent.change(phoneNumberInput, { target: { value: '+49 170 123 456' } }))

    await waitFor(() => {
      expect(phoneNumberInput).toBeValid()
      expect(result.queryByText('Invalid phone number')).toBeNull()
      expect(result.getByText('Setup SMS factor')).toBeEnabled()
    })

    await act(() => fireEvent.change(phoneNumberInput, { target: { value: '+49 (170) 123 456' } }))

    await waitFor(() => {
      expect(phoneNumberInput).toBeInvalid()
      expect(result.getByText('Invalid phone number')).toBeDefined()
      expect(result.getByText('Setup SMS factor')).toBeDisabled()
    })

    await act(() => fireEvent.change(phoneNumberInput, { target: { value: '0049 170 123 456' } }))

    await waitFor(() => {
      expect(phoneNumberInput).toBeInvalid()
      expect(result.getByText('Invalid phone number')).toBeDefined()
      expect(result.getByText('Setup SMS factor')).toBeDisabled()
    })

    await act(() => fireEvent.change(phoneNumberInput, { target: { value: '+49 160 420 69' } }))

    await waitFor(() => {
      expect(phoneNumberInput).toBeValid()
      expect(result.queryByText('Invalid phone number')).toBeNull()
      expect(result.getByText('Setup SMS factor')).toBeEnabled()
    })
  })

  it('should go through register and verification flow', async () => {
    const mockSocialWalletService = getSocialWalletService() as ISocialWalletService
    mockSocialWalletService.registerSmsOtp = jest.fn().mockResolvedValue(true)
    mockSocialWalletService.verifySmsOtp = jest.fn().mockResolvedValue(true)
    const result = render(<SmsMfaForm />)
    const phoneNumberInput = result.getByLabelText('Your phone number')
    await act(() => fireEvent.change(phoneNumberInput, { target: { value: '+49 170 420 69' } }))

    await waitFor(() => {
      expect(result.getByText('Setup SMS factor')).toBeEnabled()
    })

    act(() => result.getByText('Setup SMS factor').click())

    expect(mockSocialWalletService.registerSmsOtp).toHaveBeenCalledWith('+49 170 420 69')

    await waitFor(() => {
      expect(result.queryByText('Verification code')).not.toBeNull()
    })

    result.getByTestId('digit-0').focus()

    act(() => typeInFocusedElement('1'))
    act(() => typeInFocusedElement('2'))
    act(() => typeInFocusedElement('3'))
    act(() => typeInFocusedElement('4'))
    act(() => typeInFocusedElement('5'))
    act(() => typeInFocusedElement('6'))

    expect(result.getByText('Setup SMS factor')).toBeDisabled()

    // Debounce code input
    act(() => jest.advanceTimersByTime(100))

    await waitFor(() => {
      expect(result.getByText('Setup SMS factor')).toBeEnabled()
    })

    act(() => result.getByText('Setup SMS factor').click())

    expect(mockSocialWalletService.verifySmsOtp).toBeCalledWith('+49 170 420 69', '123456')

    // Success msg visible
    await waitFor(() => {
      expect(result.queryByText('Your SMS recovery was setup successfully')).not.toBeNull()
    })
  })

  it('should show obfuscated phone number if already setup', async () => {
    setMfaStore({ sms: { number: '+49 170 420 69', type: MultiFactorType.SMS }, password: undefined })
    const result = render(<SmsMfaForm />)

    await waitFor(() => {
      expect(result.queryByText('Setup SMS factor')).toBeNull()
      expect(result.getByLabelText('Your phone number')).toHaveAttribute('readonly')
      expect(result.getByLabelText('Your phone number')).toHaveValue('+49 *** *** 69')
    })
  })
})
