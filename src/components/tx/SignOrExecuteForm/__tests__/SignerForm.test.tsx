import { useNestedSafeOwners } from '@/hooks/useNestedSafeOwners'
import useSafeInfo from '@/hooks/useSafeInfo'
import { render } from '@/tests/test-utils'
import { SignerForm } from '../SignerForm'
import { faker } from '@faker-js/faker'
import { extendedSafeInfoBuilder, addressExBuilder } from '@/tests/builders/safe'
import { generateRandomArray } from '@/tests/builders/utils'
import { type Eip1193Provider } from 'ethers'
import { type ConnectedWallet } from '@/hooks/wallets/useOnboard'
import { type ReactElement, useState } from 'react'
import { WalletContext } from '@/components/common/WalletProvider'

jest.mock('@/hooks/useNestedSafeOwners')
jest.mock('@/hooks/useSafeInfo')

const TestWalletContextProvider = ({
  connectedWallet,
  children,
}: {
  connectedWallet: ConnectedWallet | null
  children: ReactElement
}) => {
  const [signerAddress, setSignerAddress] = useState<string>()

  return (
    <WalletContext.Provider
      value={
        connectedWallet
          ? {
              connectedWallet,
              setSignerAddress,
              signer: {
                address: signerAddress || connectedWallet.address,
                chainId: '1',
                provider: null,
                isSafe: Boolean(signerAddress),
              },
            }
          : null
      }
    >
      {children}
    </WalletContext.Provider>
  )
}

describe('SignerForm', () => {
  const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
  const mockUseNestedSafeOwners = useNestedSafeOwners as jest.MockedFunction<typeof useNestedSafeOwners>

  const safeAddress = faker.finance.ethereumAddress()
  // Safe with 3 owners
  const mockSafeInfo = {
    safeAddress,
    safe: extendedSafeInfoBuilder()
      .with({ address: { value: safeAddress } })
      .with({ chainId: '1' })
      .with({ owners: generateRandomArray(() => addressExBuilder().build(), { min: 3, max: 3 }) })
      .build(),
    safeLoaded: true,
    safeLoading: false,
  }

  const mockOwners = mockSafeInfo.safe.owners

  beforeAll(() => {
    mockUseSafeInfo.mockReturnValue(mockSafeInfo)
  })

  it('should not render anything if no wallet is connected', () => {
    const result = render(
      <TestWalletContextProvider connectedWallet={null}>
        <SignerForm />
      </TestWalletContextProvider>,
    )
    expect(result.queryByText('Sign with')).toBeNull()
  })

  it('should not render if there are no nested Safes', () => {
    mockUseNestedSafeOwners.mockReturnValue([])

    const result = render(
      <TestWalletContextProvider
        connectedWallet={{
          address: faker.finance.ethereumAddress(),
          chainId: '1',
          label: 'MetaMask',
          provider: {} as Eip1193Provider,
        }}
      >
        <SignerForm />
      </TestWalletContextProvider>,
    )

    expect(result.queryByText('Sign with')).toBeNull()
  })

  it('should render sign form if there are nested Safes', () => {
    mockUseNestedSafeOwners.mockReturnValue([mockOwners[0].value])
    const result = render(
      <TestWalletContextProvider
        connectedWallet={{
          address: faker.finance.ethereumAddress(),
          chainId: '1',
          label: 'MetaMask',
          provider: {} as Eip1193Provider,
        }}
      >
        <SignerForm />
      </TestWalletContextProvider>,
    )
    expect(result.queryByText('Sign with')).toBeVisible()
  })

  it('should render execution form if there are nested Safes', () => {
    mockUseNestedSafeOwners.mockReturnValue([mockOwners[0].value])
    const result = render(
      <TestWalletContextProvider
        connectedWallet={{
          address: faker.finance.ethereumAddress(),
          chainId: '1',
          label: 'MetaMask',
          provider: {} as Eip1193Provider,
        }}
      >
        <SignerForm willExecute />
      </TestWalletContextProvider>,
    )
    expect(result.queryByText('Execute with')).toBeVisible()
  })
})
