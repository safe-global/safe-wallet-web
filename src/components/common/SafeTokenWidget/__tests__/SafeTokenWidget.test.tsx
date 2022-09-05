import { SAFE_TOKEN_ADDRESSES } from '@/config/constants'
import * as useBalances from '@/hooks/useBalances'
import * as nextRouter from 'next/router'
import * as useChainId from '@/hooks/useChainId'
import { render, waitFor } from '@/tests/test-utils'
import { TokenType } from '@gnosis.pm/safe-react-gateway-sdk'
import { ethers } from 'ethers'
import SafeTokenWidget from '..'
import { NextRouter } from 'next/router'
import { hexZeroPad } from 'ethers/lib/utils'
import { AppRoutes } from '@/config/routes'

describe('SafeTokenWidget', () => {
  const fakeSafeAddress = hexZeroPad('0x1', 20)
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.spyOn(nextRouter, 'useRouter').mockImplementation(
      () =>
        ({
          query: {
            safe: fakeSafeAddress,
          },
        } as any as NextRouter),
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
    jest.spyOn(useChainId, 'default').mockImplementation(() => '100')

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
        `href="${AppRoutes.safe.apps}?safe=${fakeSafeAddress}&appUrl=https://safe-claiming-app.pages.dev/"`,
      )
    })
  })
})
