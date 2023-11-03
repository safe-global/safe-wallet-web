import { render } from '@/tests/test-utils'
import CheckWallet from '.'
import useIsOnlySpendingLimitBeneficiary from '@/hooks/useIsOnlySpendingLimitBeneficiary'
import useIsSafeOwner from '@/hooks/useIsSafeOwner'
import useWallet from '@/hooks/wallets/useWallet'
import { chainBuilder } from '@/tests/builders/chains'

// mock useWallet
jest.mock('@/hooks/wallets/useWallet', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    address: '0x1234567890',
  })),
}))

// mock useIsSafeOwner
jest.mock('@/hooks/useIsSafeOwner', () => ({
  __esModule: true,
  default: jest.fn(() => true),
}))

// mock useIsOnlySpendingLimitBeneficiary
jest.mock('@/hooks/useIsOnlySpendingLimitBeneficiary', () => ({
  __esModule: true,
  default: jest.fn(() => false),
}))

// mock useCurrentChain
jest.mock('@/hooks/useChains', () => ({
  __esModule: true,
  useCurrentChain: jest.fn(() => chainBuilder().build()),
}))

const renderButton = () => render(<CheckWallet>{(isOk) => <button disabled={!isOk}>Continue</button>}</CheckWallet>)

describe('CheckWallet', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('renders correctly when the wallet is connected to the right chain and is an owner', () => {
    const { container } = renderButton()

    // Check that the button is enabled
    expect(container.querySelector('button')).not.toBeDisabled()
  })

  it('should disable the button when the wallet is not connected', () => {
    ;(useWallet as jest.MockedFunction<typeof useWallet>).mockReturnValueOnce(null)

    const { container } = renderButton()

    // Check that the button is disabled
    expect(container.querySelector('button')).toBeDisabled()

    // Check the tooltip text
    expect(container.querySelector('span[aria-label]')).toHaveAttribute('aria-label', 'Please connect your wallet')
  })

  it('should disable the button when the wallet is connected to the right chain but is not an owner', () => {
    ;(useIsSafeOwner as jest.MockedFunction<typeof useIsSafeOwner>).mockReturnValueOnce(false)

    const { container } = renderButton()

    expect(container.querySelector('button')).toBeDisabled()
    expect(container.querySelector('span[aria-label]')).toHaveAttribute(
      'aria-label',
      `Your connected wallet is not an owner of this Safe Account`,
    )
  })

  it('should not disable the button for non-owner spending limit benificiaries', () => {
    ;(useIsSafeOwner as jest.MockedFunction<typeof useIsSafeOwner>).mockReturnValueOnce(false)
    ;(
      useIsOnlySpendingLimitBeneficiary as jest.MockedFunction<typeof useIsOnlySpendingLimitBeneficiary>
    ).mockReturnValueOnce(true)

    const { container } = renderButton()

    expect(container.querySelector('button')).toBeDisabled()
    expect(container.querySelector('span[aria-label]')).toHaveAttribute(
      'aria-label',
      'You can only create ERC-20 transactions within your spending limit',
    )

    const { container: allowContainer } = render(
      <CheckWallet allowSpendingLimit>{(isOk) => <button disabled={!isOk}>Continue</button>}</CheckWallet>,
    )

    expect(allowContainer.querySelector('button')).not.toBeDisabled()
  })

  it('should allow non-owners if specified', () => {
    ;(useIsSafeOwner as jest.MockedFunction<typeof useIsSafeOwner>).mockReturnValueOnce(false)

    const { container } = render(
      <CheckWallet allowNonOwner>{(isOk) => <button disabled={!isOk}>Continue</button>}</CheckWallet>,
    )

    expect(container.querySelector('button')).not.toBeDisabled()
  })
})
