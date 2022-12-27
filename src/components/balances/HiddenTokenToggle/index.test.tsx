import * as useChainId from '@/hooks/useChainId'
import { fireEvent, render } from '@/tests/test-utils'
import { hexZeroPad } from 'ethers/lib/utils'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { safeParseUnits } from '@/utils/formatters'
import HiddenTokenToggle from '.'
import { useState } from 'react'

const TestComponent = () => {
  const [showHidden, setShowHidden] = useState(false)
  return (
    <HiddenTokenToggle showHiddenAssets={showHidden} toggleShowHiddenAssets={() => setShowHidden((prev) => !prev)} />
  )
}

describe('HiddenTokenToggle', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
    jest.spyOn(useChainId, 'default').mockReturnValue('5')
  })

  test('toggle hidden assets', async () => {
    const mockHiddenAssets = {
      '5': [hexZeroPad('0x3', 20)],
    }
    const mockBalances = {
      data: {
        fiatTotal: '300',
        items: [
          {
            balance: safeParseUnits('100', 18)!.toString(),
            fiatBalance: '100',
            fiatConversion: '1',
            tokenInfo: {
              address: hexZeroPad('0x2', 20),
              decimals: 18,
              logoUri: '',
              name: 'DAI',
              symbol: 'DAI',
              type: TokenType.ERC20,
            },
          },
          {
            balance: safeParseUnits('200', 18)!.toString(),
            fiatBalance: '200',
            fiatConversion: '1',
            tokenInfo: {
              address: hexZeroPad('0x3', 20),
              decimals: 18,
              logoUri: '',
              name: 'SPAM',
              symbol: 'SPM',
              type: TokenType.ERC20,
            },
          },
        ],
      },
      loading: false,
      error: undefined,
    }

    const result = render(<TestComponent />, {
      initialReduxState: {
        balances: mockBalances,
        settings: {
          currency: 'usd',
          hiddenTokens: mockHiddenAssets,
          shortName: {
            show: true,
            copy: true,
            qr: true,
          },
          theme: {
            darkMode: true,
          },
        },
      },
    })

    expect(result.queryByTestId('VisibilityOutlinedIcon')).not.toBeNull()
    expect(result.queryByTestId('VisibilityOffOutlinedIcon')).toBeNull()

    fireEvent.click(result.getByTestId('toggle-hidden-assets'))

    expect(result.queryByTestId('VisibilityOutlinedIcon')).toBeNull()
    expect(result.queryByTestId('VisibilityOffOutlinedIcon')).not.toBeNull()

    fireEvent.click(result.getByTestId('toggle-hidden-assets'))

    expect(result.queryByTestId('VisibilityOutlinedIcon')).not.toBeNull()
    expect(result.queryByTestId('VisibilityOffOutlinedIcon')).toBeNull()
  })

  test('Do not render hidden tokens toggle if none are hidden', () => {
    const mockHiddenAssets = {
      '5': [hexZeroPad('0x3', 20)],
    }

    const mockBalances = {
      data: {
        fiatTotal: '300',
        items: [
          {
            balance: safeParseUnits('100', 18)!.toString(),
            fiatBalance: '100',
            fiatConversion: '1',
            tokenInfo: {
              address: hexZeroPad('0x2', 20),
              decimals: 18,
              logoUri: '',
              name: 'DAI',
              symbol: 'DAI',
              type: TokenType.ERC20,
            },
          },
        ],
      },
      loading: false,
      error: undefined,
    }
    const result = render(<TestComponent />, {
      initialReduxState: {
        balances: mockBalances,
        settings: {
          currency: 'usd',
          hiddenTokens: mockHiddenAssets,
          shortName: {
            show: true,
            copy: true,
            qr: true,
          },
          theme: {
            darkMode: true,
          },
        },
      },
    })

    expect(result.queryByTestId('toggle-hidden-assets')).toBeNull()
  })
})
