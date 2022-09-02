import { SAFE_TOKEN_ADDRESSES } from '@/config/constants'
import * as useBalances from '@/hooks/useBalances'
import * as useChainId from '@/hooks/useChainId'
import { render, waitFor } from '@/tests/test-utils'
import { TokenType } from '@gnosis.pm/safe-react-gateway-sdk'
import { ethers } from 'ethers'
import SafeTokenWidget from '..'

describe('SafeTokenWidget', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
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
      expect(result.baseElement).toContainHTML(`appUrl=https://safe-claiming-app.pages.dev/`)
    })
  })
})
