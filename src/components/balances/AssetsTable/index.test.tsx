import * as useChainId from '@/hooks/useChainId'
import { fireEvent, getByTestId, render, waitFor } from '@/tests/test-utils'
import { safeParseUnits } from '@/utils/formatters'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { hexZeroPad } from 'ethers/lib/utils'
import { useState } from 'react'
import AssetsTable from '.'

const TestComponent = () => {
  const [showHidden, setShowHidden] = useState(false)
  return (
    <>
      <AssetsTable showHiddenAssets={showHidden} setShowHiddenAssets={setShowHidden} />
      <button data-testid="showHidden" onClick={() => setShowHidden((prev) => !prev)} />
    </>
  )
}

describe('AssetsTable', () => {
  beforeEach(() => {
    window.localStorage.clear()
    jest.clearAllMocks()
    jest.spyOn(useChainId, 'default').mockReturnValue('5')
  })

  test('select and deselect hidden assets', async () => {
    const mockHiddenAssets = {
      '5': [hexZeroPad('0x2', 20), hexZeroPad('0x3', 20)],
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
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOffOutlinedIcon'))

    tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOffOutlinedIcon'))

    // hide them again
    tableRow = result.getByText('100 DAI').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOutlinedIcon'))

    tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOutlinedIcon'))

    const saveButton = result.getByText('Apply')
    fireEvent.click(saveButton)

    // Both tokens should still be hidden
    expect(result.queryByText('100 DAI')).toBeNull()
    expect(result.queryByText('200 SPM')).toBeNull()
  })

  test('select and deselect visible assets', async () => {
    const mockHiddenAssets = {
      '5': [],
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

    // Initially we see all tokens
    expect(result.queryByText('100 DAI')).not.toBeNull()
    expect(result.queryByText('200 SPM')).not.toBeNull()

    // hide both tokens
    let tableRow = result.getByText('100 DAI').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOutlinedIcon'))

    tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOutlinedIcon'))

    // unhide them again
    tableRow = result.getByText('100 DAI').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOffOutlinedIcon'))

    tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOffOutlinedIcon'))

    // We deselected everything => no Apply button visible
    expect(result.queryByText('Apply')).toBeNull()
  })

  test('hideAndUnhideAssets', async () => {
    const mockHiddenAssets = {
      '5': [],
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

    const toggleHiddenButton = result.getByTestId('showHidden')

    // Initially we see all tokens (as none are hidden)
    expect(result.queryByText('100 DAI')).not.toBeNull()
    expect(result.queryByText('200 SPM')).not.toBeNull()

    // toggle spam token
    let tableRow = result.getByText('200 SPM').parentElement?.parentElement
    expect(tableRow).toBeDefined()

    // hide button
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOutlinedIcon'))

    // Apply changes
    let saveButton = result.getByText('Apply')
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
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOffOutlinedIcon'))
    const resetButton = result.getByText('Cancel')
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
    fireEvent.click(getByTestId(tableRow!, 'VisibilityOffOutlinedIcon'))
    saveButton = result.getByText('Apply')
    fireEvent.click(saveButton)

    // Both tokens are visible again
    await waitFor(() => {
      expect(result.queryByText('100 DAI')).not.toBeNull()
      expect(result.queryByText('200 SPM')).not.toBeNull()
    })
  })
})
