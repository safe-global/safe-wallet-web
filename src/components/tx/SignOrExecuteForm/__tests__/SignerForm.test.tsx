import { useNestedSafeOwners } from '@/hooks/useNestedSafeOwners'
import useSafeInfo from '@/hooks/useSafeInfo'
import useWallet from '@/hooks/wallets/useWallet'
import { render } from '@/tests/test-utils'
import { SignerForm } from '../SignerForm'
import { faker } from '@faker-js/faker'
import { extendedSafeInfoBuilder, addressExBuilder } from '@/tests/builders/safe'
import { generateRandomArray } from '@/tests/builders/utils'
import { type Eip1193Provider } from 'ethers'

jest.mock('@/hooks/useNestedSafeOwners')
jest.mock('@/hooks/useSafeInfo')
jest.mock('@/hooks/wallets/useWallet')

describe('SignerForm', () => {
  const mockUseSafeInfo = useSafeInfo as jest.MockedFunction<typeof useSafeInfo>
  const mockUseNestedSafeOwners = useNestedSafeOwners as jest.MockedFunction<typeof useNestedSafeOwners>
  const mockUseWallet = useWallet as jest.MockedFunction<typeof useWallet>

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
    mockUseWallet.mockReturnValue(null)

    const result = render(<SignerForm />)
    expect(result.queryByText('Signer')).toBeNull()
  })

  it('should not render if there are no nested Safes', () => {
    mockUseWallet.mockReturnValue({
      address: faker.finance.ethereumAddress(),
      chainId: '1',
      label: 'MetaMask',
      provider: {} as Eip1193Provider,
    })
    mockUseNestedSafeOwners.mockReturnValue([])
    render(<SignerForm />)
  })

  it('should render form if there are nested Safes', () => {
    mockUseWallet.mockReturnValue({
      address: faker.finance.ethereumAddress(),
      chainId: '1',
      label: 'MetaMask',
      provider: {} as Eip1193Provider,
    })
    mockUseNestedSafeOwners.mockReturnValue([
      {
        address: mockOwners[0].value,
        chainId: '1',
        isWatchlist: false,
      },
    ])
    render(<SignerForm />)
  })
})
