import { render } from '@/tests/test-utils'
import { WalletInfo } from '@/components/common/WalletInfo/index'
import { type EIP1193Provider, type OnboardAPI } from '@web3-onboard/core'
import { type NextRouter } from 'next/router'
import * as mpcModule from '@/services/mpc/module'
import * as constants from '@/config/constants'
import * as mfaHelper from '@/components/settings/SignerAccountMFA/helper'
import { type Web3AuthMPCCoreKit } from '@web3auth/mpc-core-kit'

const mockWallet = {
  address: '0x1234567890123456789012345678901234567890',
  chainId: '5',
  label: '',
  provider: null as unknown as EIP1193Provider,
}

const mockRouter = {
  query: {},
  pathname: '',
} as NextRouter

const mockOnboard = {
  connectWallet: jest.fn(),
  disconnectWallet: jest.fn(),
  setChain: jest.fn(),
} as unknown as OnboardAPI

describe('WalletInfo', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it('should display the wallet address', () => {
    const { getByText } = render(
      <WalletInfo
        wallet={mockWallet}
        resetAccount={jest.fn()}
        mpcCoreKit={undefined}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
      />,
    )

    expect(getByText('0x1234...7890')).toBeInTheDocument()
  })

  it('should display a switch wallet button', () => {
    const { getByText } = render(
      <WalletInfo
        wallet={mockWallet}
        resetAccount={jest.fn()}
        mpcCoreKit={undefined}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
      />,
    )

    expect(getByText('Switch wallet')).toBeInTheDocument()
  })

  it('should display a Disconnect button', () => {
    const { getByText } = render(
      <WalletInfo
        wallet={mockWallet}
        resetAccount={jest.fn()}
        mpcCoreKit={undefined}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
      />,
    )

    expect(getByText('Disconnect')).toBeInTheDocument()
  })

  it('should display a Delete Account button on dev for social login', () => {
    jest.spyOn(mpcModule, 'isSocialLoginWallet').mockReturnValue(true)
    jest.spyOn(constants, 'IS_PRODUCTION', 'get').mockImplementation(() => false)

    const { getByText } = render(
      <WalletInfo
        wallet={mockWallet}
        resetAccount={jest.fn()}
        mpcCoreKit={undefined}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
      />,
    )

    expect(getByText('Delete Account')).toBeInTheDocument()
  })

  it('should not display a Delete Account on prod', () => {
    jest.spyOn(mpcModule, 'isSocialLoginWallet').mockReturnValue(true)
    jest.spyOn(constants, 'IS_PRODUCTION', 'get').mockImplementation(() => true)

    const { queryByText } = render(
      <WalletInfo
        wallet={mockWallet}
        resetAccount={jest.fn()}
        mpcCoreKit={undefined}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
      />,
    )

    expect(queryByText('Delete Account')).not.toBeInTheDocument()
  })

  it('should not display a Delete Account if not social login', () => {
    jest.spyOn(mpcModule, 'isSocialLoginWallet').mockReturnValue(false)
    jest.spyOn(constants, 'IS_PRODUCTION', 'get').mockImplementation(() => false)

    const { queryByText } = render(
      <WalletInfo
        wallet={mockWallet}
        resetAccount={jest.fn()}
        mpcCoreKit={undefined}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
      />,
    )

    expect(queryByText('Delete Account')).not.toBeInTheDocument()
  })

  it('should display an enable mfa button if mfa is not enabled', () => {
    jest.spyOn(mpcModule, 'isSocialLoginWallet').mockReturnValue(true)
    jest.spyOn(mfaHelper, 'isMFAEnabled').mockReturnValue(false)

    const { getByText } = render(
      <WalletInfo
        wallet={mockWallet}
        resetAccount={jest.fn()}
        mpcCoreKit={{} as Web3AuthMPCCoreKit}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
      />,
    )

    expect(getByText('Add multifactor authentication')).toBeInTheDocument()
  })

  it('should not display an enable mfa button if mfa is already enabled', () => {
    jest.spyOn(mpcModule, 'isSocialLoginWallet').mockReturnValue(true)
    jest.spyOn(mfaHelper, 'isMFAEnabled').mockReturnValue(true)

    const { queryByText } = render(
      <WalletInfo
        wallet={mockWallet}
        resetAccount={jest.fn()}
        mpcCoreKit={{} as Web3AuthMPCCoreKit}
        router={mockRouter}
        onboard={mockOnboard}
        addressBook={{}}
        handleClose={jest.fn()}
      />,
    )

    expect(queryByText('Add multifactor authentication')).not.toBeInTheDocument()
  })
})
