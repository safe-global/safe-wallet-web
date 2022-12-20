import * as useChainId from '@/hooks/useChainId'
import type { RootState } from '@/store'
import { fireEvent, getByTestId, render, waitFor } from '@/tests/test-utils'
import { safeParseUnits } from '@/utils/formatters'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { hexZeroPad } from 'ethers/lib/utils'
import AssetsTable from '.'

import HiddenAssetsProvider, { HiddenAssetsContext } from '../HiddenAssetsProvider'

const customRender = (ui: React.ReactElement, { ...renderOptions }: { initialReduxState?: Partial<RootState> }) => {
  return render(<HiddenAssetsProvider>{ui}</HiddenAssetsProvider>, renderOptions)
}

const TestComponent = () => (
  <HiddenAssetsContext.Consumer>
    {(value) => {
      return (
        <>
          <AssetsTable />
          <button data-testid="save" onClick={value.saveChanges} />
          <button data-testid="reset" onClick={value.reset} />
          <button data-testid="showHidden" onClick={value.toggleShowHiddenAssets} />
        </>
      )
    }}
  </HiddenAssetsContext.Consumer>
)

describe('AssetsTable', () => {
  beforeEach(() => {
    window.localStorage.clear()
    jest.clearAllMocks()
    jest.spyOn(useChainId, 'default').mockReturnValue('5')
  })

  test('select and deselect hidden assets', async () => {
    const mockHiddenAssets = {
      '5': {
        [hexZeroPad('0x2', 20)]: hexZeroPad('0x2', 20),
        [hexZeroPad('0x3', 20)]: hexZeroPad('0x3', 20),
      },
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

    const saveButton = result.getByTestId('save')
    const toggleHiddenButton = result.getByTestId('showHidden')

    // Show only hidden assets
    fireEvent.click(toggleHiddenButton)

    await waitFor(() => {
      expect(result.queryByText('100 DAI')).not.toBeNull()
      expect(result.queryByText('200 SPM')).not.toBeNull()
    })

    // unhide both tokens
    let tableRow = result.getByText('100 DAI').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOutlinedIcon'))

    tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOutlinedIcon'))

    // hide them again
    tableRow = result.getByText('100 DAI').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOffOutlinedIcon'))

    tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOffOutlinedIcon'))

    fireEvent.click(saveButton)

    // Both tokens should still be hidden
    expect(result.queryByText('100 DAI')).toBeNull()
    expect(result.queryByText('200 SPM')).toBeNull()
  })

  test('select and deselect visible assets', async () => {
    const mockHiddenAssets = {
      '5': {},
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

    const saveButton = result.getByTestId('save')

    // Initially we see all tokens
    expect(result.queryByText('100 DAI')).not.toBeNull()
    expect(result.queryByText('200 SPM')).not.toBeNull()

    // hide both tokens
    let tableRow = result.getByText('100 DAI').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOffOutlinedIcon'))

    tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOffOutlinedIcon'))

    // unhide them again
    tableRow = result.getByText('100 DAI').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOutlinedIcon'))

    tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOutlinedIcon'))

    fireEvent.click(saveButton)

    // Unchanged as we deselected before saving
    expect(result.queryByText('100 DAI')).not.toBeNull()
    expect(result.queryByText('200 SPM')).not.toBeNull()
  })

  test('hideAndUnhideAssets', async () => {
    const mockHiddenAssets = {
      '5': {},
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

    const saveButton = result.getByTestId('save')
    const resetButton = result.getByTestId('reset')
    const toggleHiddenButton = result.getByTestId('showHidden')

    // Initially we see all tokens (as none are hidden)
    expect(result.queryByText('100 DAI')).not.toBeNull()
    expect(result.queryByText('200 SPM')).not.toBeNull()

    // toggle spam token
    let tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()

    // hide button
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOffOutlinedIcon'))

    // Apply changes
    fireEvent.click(saveButton)

    // SPAM token is hidden now
    await waitFor(() => {
      expect(result.queryByText('100 DAI')).not.toBeNull()
      expect(result.queryByText('200 SPM')).toBeNull()
    })

    // show hidden tokens
    fireEvent.click(toggleHiddenButton)

    // Only hidden token is visible
    await waitFor(() => {
      expect(result.queryByText('DAI')).toBeNull()
      expect(result.queryByText('100 DAI')).toBeNull()

      expect(result.queryByText('SPAM')).not.toBeNull()
      expect(result.queryByText('200 SPM')).not.toBeNull()
    })

    // Unhide token & reset (make no changes)
    tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOutlinedIcon'))
    fireEvent.click(resetButton)

    // SPAM token is hidden again
    await waitFor(() => {
      expect(result.queryByText('100 DAI')).not.toBeNull()
      expect(result.queryByText('200 SPM')).toBeNull()
    })

    // show hidden tokens
    fireEvent.click(toggleHiddenButton)

    // Unhide token & apply
    tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOutlinedIcon'))
    fireEvent.click(saveButton)

    // Both tokens are visible again
    await waitFor(() => {
      expect(result.queryByText('100 DAI')).not.toBeNull()
      expect(result.queryByText('200 SPM')).not.toBeNull()
    })
  })
})
