import { SAFE_TOKEN_ADDRESS } from '@/config/constants'
import * as useBalances from '@/hooks/useBalances'
import { render, waitFor } from '@/tests/test-utils'
import { TokenType } from '@gnosis.pm/safe-react-gateway-sdk'
import { ethers } from 'ethers'
import SafeTokenWidget from '../SafeTokenWidget'

describe('SafeTokenWidget', () => {
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

  it('Should display the value rounded down if balance has safe token', async () => {
    jest.spyOn(useBalances, 'default').mockImplementation(() => ({
      balances: {
        fiatTotal: '0',
        items: [
          {
            balance: ethers.utils.parseEther('420.69').toString(),
            fiatBalance: '0',
            fiatConversion: '1',
            tokenInfo: {
              address: SAFE_TOKEN_ADDRESS,
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
      expect(result.baseElement).toHaveTextContent('420')
      expect(result.baseElement).not.toHaveTextContent('420.69')
    })
  })
})
