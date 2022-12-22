import * as useChainId from '@/hooks/useChainId'
import type { RootState } from '@/store'
import { fireEvent, render } from '@/tests/test-utils'
import { safeParseUnits } from '@/utils/formatters'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { hexZeroPad } from 'ethers/lib/utils'
import TokenMenu from '.'
import HiddenAssetsProvider, { HiddenAssetsContext } from '../HiddenAssetsProvider'

const customRender = (ui: React.ReactElement, { ...renderOptions }: { initialReduxState?: Partial<RootState> }) => {
  return render(<HiddenAssetsProvider>{ui}</HiddenAssetsProvider>, renderOptions)
}

const TestComponent = () => (
  <HiddenAssetsContext.Consumer>
    {(value) => (
      <>
        <TokenMenu />
        <button data-testid="toggleAsset1" onClick={() => value.toggleAsset(hexZeroPad('0x2', 20))} />
        <button data-testid="toggleAsset2" onClick={() => value.toggleAsset(hexZeroPad('0x3', 20))} />
        <button data-testid="toggleShowHiddenAssets" onClick={value.toggleShowHiddenAssets} />
      </>
    )}
  </HiddenAssetsContext.Consumer>
)

describe('TokenMenu', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
    jest.spyOn(useChainId, 'default').mockReturnValue('5')
  })

  test('do not render the menu initially', () => {
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

    const result = customRender(<TestComponent />, {
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

    expect(result.queryByText('Cancel')).toBeNull()
    expect(result.queryByText('Apply')).toBeNull()
  })

  test('render if showHiddenAssets is toggled', () => {
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

    const result = customRender(<TestComponent />, {
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

    const showHiddenAssets = result.getByTestId('toggleShowHiddenAssets')

    fireEvent.click(showHiddenAssets)

    expect(result.queryAllByText('1 token selected')).not.toBeNull()
  })

  test('toggle asset and cancel', () => {
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

    const result = customRender(<TestComponent />, {
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

    const toggleAsset1 = result.getByTestId('toggleAsset1')
    const showHiddenAssets = result.getByTestId('toggleShowHiddenAssets')

    fireEvent.click(toggleAsset1)

    expect(result.queryAllByText('1 token selected')).not.toBeNull()

    fireEvent.click(result.getByText('Cancel'))

    // After resetting the buttons should disappear
    expect(result.queryByText('Cancel')).toBeNull()
    expect(result.queryByText('Apply')).toBeNull()

    fireEvent.click(showHiddenAssets)
    expect(result.queryAllByText('1 token selected')).not.toBeNull()
  })

  test('toggle and save asset', () => {
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

    const result = customRender(<TestComponent />, {
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

    const toggleAsset1 = result.getByTestId('toggleAsset1')
    const showHiddenAssets = result.getByTestId('toggleShowHiddenAssets')

    fireEvent.click(toggleAsset1)

    expect(result.queryAllByText('1 token selected')).not.toBeNull()

    fireEvent.click(result.getByText('Apply'))

    // After saving the buttons should disappear
    expect(result.queryByText('Cancel')).toBeNull()
    expect(result.queryByText('Apply')).toBeNull()

    fireEvent.click(showHiddenAssets)
    expect(result.queryAllByText('2 tokens selected')).not.toBeNull()
  })
})
