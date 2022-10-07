import { SAFE_TOKEN_ADDRESSES } from '@/config/constants'
import * as useBalances from '@/hooks/useBalances'
import * as nextRouter from 'next/router'
import useChainId from '@/hooks/useChainId'
import { render, waitFor } from '@/tests/test-utils'
import { SafeAppAccessPolicyTypes, TokenType } from '@gnosis.pm/safe-react-gateway-sdk'
import { ethers } from 'ethers'
import SafeTokenWidget from '..'
import { hexZeroPad } from 'ethers/lib/utils'
import { AppRoutes } from '@/config/routes'
import * as useSafeApps from '@/hooks/safe-apps/useSafeApps'

const MOCK_CLAIMING_APP_URL = 'https://fake.claiming-app.safe.global'

jest.mock('@/hooks/useChainId')

describe('SafeTokenWidget', () => {
  beforeAll(() => {
    ;(useChainId as jest.Mock).mockImplementation(jest.fn(() => '4'))
  })

  const fakeSafeAddress = hexZeroPad('0x1', 20)
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.spyOn(nextRouter, 'useRouter').mockImplementation(
      () =>
        ({
          query: {
            safe: fakeSafeAddress,
          },
        } as any),
    )
    jest.spyOn(useSafeApps, 'useSafeApps').mockImplementation(
      () =>
        ({
          allSafeApps: [
            {
              id: 61,
              url: MOCK_CLAIMING_APP_URL,
              chainIds: ['4'],
              name: '$SAFE Claiming App',
              description: '',
              iconUrl: '',
              tags: '',
              accessControl: {
                type: SafeAppAccessPolicyTypes.NoRestrictions,
              },
            },
          ],
        } as any),
    )
  })

  it('Should display skeleton if balance is loading', () => {
    jest.spyOn(useBalances, 'default').mockImplementation(() => ({
      balances: {
        fiatTotal: '0',
        items: [],
      },
      loading: true,
      error: undefined,
    }))

    const result = render(<SafeTokenWidget />)
    expect(result.baseElement).not.toHaveTextContent('0')
  })

  it('Should render nothing for unsupported chains', () => {
    ;(useChainId as jest.Mock).mockImplementationOnce(jest.fn(() => '100'))

    jest.spyOn(useBalances, 'default').mockImplementation(() => ({
      balances: {
        fiatTotal: '0',
        items: [],
      },
      loading: true,
      error: undefined,
    }))

    const result = render(<SafeTokenWidget />)
    expect(result.baseElement).toContainHTML('<body><div /></body>')
  })

  it('Should display 0 if balance has no safe token', async () => {
    jest.spyOn(useBalances, 'default').mockImplementation(() => ({
      balances: {
        fiatTotal: '0',
        items: [],
      },
      loading: false,
      error: undefined,
    }))

    const result = render(<SafeTokenWidget />)
    await waitFor(() => expect(result.baseElement).toHaveTextContent('0'))
  })

  it('Should display the value formatted correctly', async () => {
    jest.spyOn(useBalances, 'default').mockImplementation(() => ({
      balances: {
        fiatTotal: '0',
        items: [
          {
            balance: ethers.utils.parseEther('420000.691').toString(),
            fiatBalance: '0',
            fiatConversion: '1',
            tokenInfo: {
              address: SAFE_TOKEN_ADDRESSES['4'],
              decimals: 18,
              logoUri: '',
              name: 'SAFE Token',
              symbol: 'SAFE',
              type: TokenType.ERC20,
            },
          },
        ],
      },
      loading: false,
      error: undefined,
    }))
    // to avoid failing tests in some environments
    const NumberFormat = Intl.NumberFormat
    const englishTestLocale = 'en'

    jest
      .spyOn(Intl, 'NumberFormat')
      .mockImplementation((locale, ...rest) => new NumberFormat([englishTestLocale], ...rest))

    const result = render(<SafeTokenWidget />)
    await waitFor(() => {
      expect(result.baseElement).toHaveTextContent('420,000.69')
      expect(result.baseElement).not.toHaveTextContent('420,000.691')
    })
  })

  it('Should render a link to the claiming app', async () => {
    jest.spyOn(useBalances, 'default').mockImplementation(() => ({
      balances: {
        fiatTotal: '0',
        items: [
          {
            balance: ethers.utils.parseEther('1').toString(),
            fiatBalance: '0',
            fiatConversion: '1',
            tokenInfo: {
              address: SAFE_TOKEN_ADDRESSES['4'],
              decimals: 18,
              logoUri: '',
              name: 'SAFE Token',
              symbol: 'SAFE',
              type: TokenType.ERC20,
            },
          },
        ],
      },
      loading: false,
      error: undefined,
    }))

    const result = render(<SafeTokenWidget />)
    await waitFor(() => {
      expect(result.baseElement).toContainHTML(
        `href="${AppRoutes.apps}?safe=${fakeSafeAddress}&appUrl=${encodeURIComponent(MOCK_CLAIMING_APP_URL)}"`,
      )
    })
  })
})
