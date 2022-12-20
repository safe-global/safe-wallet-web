import * as useChainId from '@/hooks/useChainId'
import type { RootState } from '@/store'
import { fireEvent, getByRole, render, waitFor } from '@/tests/test-utils'
import HiddenAssetsProvider, { HiddenAssetsContext } from '../HiddenAssetsProvider'
import { hexZeroPad } from 'ethers/lib/utils'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { safeParseUnits } from '@/utils/formatters'
import TokenListSelect from '.'

const customRender = (ui: React.ReactElement, { ...renderOptions }: { initialReduxState?: Partial<RootState> }) => {
  return render(<HiddenAssetsProvider>{ui}</HiddenAssetsProvider>, renderOptions)
}

const TestComponent = () => (
  <HiddenAssetsContext.Consumer>
    {(value) => (
      <>
        <TokenListSelect />
        <span data-testid="visibleAssets">{value.visibleAssets.map((asset) => asset.tokenInfo.address)}</span>
        <span data-testid="showHiddenAssets">{value.showHiddenAssets.toString()}</span>
      </>
    )}
  </HiddenAssetsContext.Consumer>
)

describe('TokenListSelect', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    jest.spyOn(useChainId, 'default').mockReturnValue('5')
  })

  test('toggle hidden assets', async () => {
    const mockHiddenAssets = {
      '5': { [hexZeroPad('0x3', 20)]: hexZeroPad('0x3', 20) },
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
        hiddenAssets: mockHiddenAssets,
      },
    })

    const visibleAssets = result.getByTestId('visibleAssets')
    const showHiddenAssets = result.getByTestId('showHiddenAssets')
    const selectElement = result.getByTestId('tokenlist-select')

    expect(visibleAssets).toContainHTML(hexZeroPad('0x2', 20))
    expect(visibleAssets).not.toContainHTML(hexZeroPad('0x3', 20))

    expect(showHiddenAssets).toContainHTML('false')

    // Toggle hidden tokens
    fireEvent.mouseDown(getByRole(selectElement, 'button'))
    fireEvent.click(result.getByText('Show 1 hidden token(s)'))

    await waitFor(() => {
      expect(visibleAssets).toContainHTML(hexZeroPad('0x3', 20))
      expect(showHiddenAssets).toContainHTML('true')
    })

    // Toggle hidden tokens
    fireEvent.mouseDown(getByRole(selectElement, 'button'))
    fireEvent.click(result.getByText('Hide 1 hidden token(s)'))

    await waitFor(() => {
      expect(visibleAssets).toContainHTML(hexZeroPad('0x2', 20))
      expect(showHiddenAssets).toContainHTML('false')
    })
  })

  test('Disable show hidden tokens toggle if none are hidden', () => {
    const mockHiddenAssets = {
      '5': { [hexZeroPad('0x3', 20)]: hexZeroPad('0x3', 20) },
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

    const result = customRender(<TestComponent />, {
      initialReduxState: {
        balances: mockBalances,
        hiddenAssets: mockHiddenAssets,
      },
    })

    const selectElement = result.getByTestId('tokenlist-select')
    fireEvent.mouseDown(getByRole(selectElement, 'button'))
    expect(result.getByText('Show 0 hidden token(s)').parentElement).toHaveAttribute('aria-disabled', 'true')
  })
})
