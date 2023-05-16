import {
  fireEvent,
  getAllByRole,
  getByRole,
  getByText,
  mockWeb3Provider,
  render,
  type RenderResult,
  waitFor,
  act,
} from '@/tests/test-utils'
import ApprovalEditor from '.'
import { type SafeBalanceResponse, TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { hexlify, hexZeroPad, Interface } from 'ethers/lib/utils'
import { ERC20__factory, Multi_send_call_only__factory } from '@/types/contracts'
import type { BaseTransaction } from '@safe-global/safe-apps-sdk'
import { encodeMultiSendData } from '@safe-global/safe-core-sdk/dist/src/utils/transactions/utils'
import { parseUnits } from '@ethersproject/units'
import { getMultiSendCallOnlyContractAddress } from '@/services/contracts/safeContracts'
import { type SafeSignature, type SafeTransaction } from '@safe-global/safe-core-sdk-types'

const PREFIX_TEXT = 'Approve access to'
const ERC20_INTERFACE = ERC20__factory.createInterface()

const createApproveCallData = (spender: string, value: string) => {
  return ERC20_INTERFACE.encodeFunctionData('approve', [spender, value])
}

const createNonApproveCallData = (to: string, value: string) => {
  return ERC20_INTERFACE.encodeFunctionData('transfer', [to, value])
}

const getApprovalSummaryElement = (text: string, result: RenderResult): HTMLElement => {
  const accordionSummary = result.getByText(PREFIX_TEXT, { exact: false })
  expect(accordionSummary.parentElement).not.toBeNull()
  return accordionSummary.parentElement!
}

const renderEditor = async (txs: BaseTransaction[], updateTxs?: (newTxs: BaseTransaction[]) => void) => {
  if (txs.length === 0) {
    // eslint-disable-next-line react/display-name
    return () => <ApprovalEditor safeTransaction={undefined} updateTransaction={updateTxs} />
  }

  let txData: string
  let to: string
  if (txs.length > 1) {
    const multiSendCallData = encodeMultiSendData(txs.map((tx) => ({ ...tx, operation: 0 })))
    txData = Multi_send_call_only__factory.createInterface().encodeFunctionData('multiSend', [multiSendCallData])
    to = getMultiSendCallOnlyContractAddress('1') || '0x1'
  } else {
    txData = txs[0].data
    to = txs[0].to
  }

  const safeTx: SafeTransaction = {
    data: {
      to,
      data: txData,
      baseGas: 0,
      gasPrice: 0,
      gasToken: '0x0',
      nonce: 1,
      operation: txs.length > 1 ? 1 : 0,
      refundReceiver: '0x0',
      safeTxGas: 0,
      value: '0x0',
    },
    signatures: new Map(),
    addSignature: function (signature: SafeSignature): void {
      throw new Error('Function not implemented.')
    },
    encodedSignatures: function (): string {
      throw new Error('Function not implemented.')
    },
  }
  // eslint-disable-next-line react/display-name
  return () => <ApprovalEditor safeTransaction={safeTx} updateTransaction={updateTxs} />
}

describe('ApprovalEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  // Edit mode is used in the ReviewSafeAppsTxModal
  // There we pass in an array of BaseTransactions.
  describe('in edit mode', () => {
    const updateCallback = jest.fn()

    describe('should render null', () => {
      it('for empty txs', async () => {
        const Editor = await renderEditor([], updateCallback)
        const result = render(<Editor />)
        expect(result.container).toBeEmptyDOMElement()
      })

      it('for a single tx containing an approve call with wrong params', async () => {
        const testInterface = new Interface(['function approve(address, uint256, uint8)'])
        const txs = [
          {
            to: hexZeroPad('0x123', 20),
            data: testInterface.encodeFunctionData('approve', [hexZeroPad('0x2', 20), '123', '1']),
            value: '0',
          },
        ]
        const Editor = await renderEditor(txs, updateCallback)
        const result = render(<Editor />)
        expect(result.container).toBeEmptyDOMElement()
      })

      it('for multiple non approve txs', async () => {
        const txs = [
          {
            to: hexZeroPad('0x123', 20),
            data: createNonApproveCallData(hexZeroPad('0x2', 20), '200'),
            value: '0',
          },
          {
            to: hexZeroPad('0x123', 20),
            data: createNonApproveCallData(hexZeroPad('0x3', 20), '12'),
            value: '0',
          },
        ]
        const Editor = await renderEditor(txs, updateCallback)

        const result = render(<Editor />)
        expect(result.container).toBeEmptyDOMElement()
      })
    })

    it('should render and edit multiple txs with partly missing token info', async () => {
      const tokenAddress1 = hexZeroPad('0x123', 20)
      const tokenAddress2 = hexZeroPad('0x234', 20)

      // tokenAddress2 gets its infos from the web3 provider
      mockWeb3Provider([
        {
          returnType: 'uint8',
          returnValue: '12',
          signature: 'decimals()',
        },
        {
          returnType: 'string',
          returnValue: 'OTHER',
          signature: 'symbol()',
        },
      ])
      const mockBalances: SafeBalanceResponse = {
        fiatTotal: '100',
        items: [
          {
            balance: '100',
            fiatBalance: '100',
            fiatConversion: '1',
            tokenInfo: {
              address: tokenAddress1,
              decimals: 18,
              logoUri: '',
              name: 'Test',
              symbol: 'TST',
              type: TokenType.ERC20,
            },
          },
        ],
      }
      const txs = [
        {
          to: tokenAddress1,
          data: createApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('100', 18))),
          value: '0',
        },
        {
          to: tokenAddress1,
          data: createNonApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('200', 18))),
          value: '0',
        },
        {
          to: tokenAddress2,
          data: createApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('300', 12))),
          value: '0',
        },
      ]
      const Editor = await renderEditor(txs, updateCallback)

      const result = render(<Editor />, {
        initialReduxState: {
          balances: { data: mockBalances, loading: false },
        },
      })
      await waitFor(() => {
        const accordionSummary = getApprovalSummaryElement(PREFIX_TEXT, result)
        getByText(accordionSummary, '2', { exact: false })
        getByText(accordionSummary, 'Tokens', { exact: false })
      })

      // Edit first approval
      {
        const accordionSummary = getApprovalSummaryElement(PREFIX_TEXT, result)
        const parentContainer = accordionSummary.closest('.MuiPaper-root')
        const accordionDetails = parentContainer?.querySelector('.MuiAccordionDetails-root')
        expect(accordionDetails).not.toBeNull()

        // toggle edit row
        const buttons = getAllByRole(accordionDetails as HTMLElement, 'button')
        // 2 rows with one button each
        expect(buttons).toHaveLength(2)

        await waitFor(() => {
          const amountInput = accordionDetails?.querySelector('input[name="approvals.0"]') as HTMLInputElement
          expect(amountInput).not.toBeNull()
          expect(amountInput).toHaveValue('100.0')
          expect(amountInput).toBeEnabled()
        })

        const amountInput = accordionDetails?.querySelector('input[name="approvals.0"]') as HTMLInputElement

        await act(() => {
          fireEvent.change(amountInput!, { target: { value: '123' } })
        })

        await act(() => {
          buttons[0].click()
        })

        await waitFor(() => {
          expect(updateCallback).toHaveBeenCalledWith([
            {
              to: tokenAddress1,
              data: createApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('123', 18))),
              value: '0',
            },
            {
              to: tokenAddress1,
              data: createNonApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('200', 18))),
              value: '0',
            },
            {
              to: tokenAddress2,
              data: createApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('300', 12))),
              value: '0',
            },
          ])
        })
      }

      // Edit second approval
      {
        const accordionSummary = getApprovalSummaryElement(PREFIX_TEXT, result)
        const parentContainer = accordionSummary.closest('.MuiPaper-root')
        const accordionDetails = parentContainer?.querySelector('.MuiAccordionDetails-root')
        expect(accordionDetails).not.toBeNull()

        // toggle edit row
        const buttons = getAllByRole(accordionDetails as HTMLElement, 'button')
        // 2 rows with one button each
        expect(buttons).toHaveLength(2)
        await waitFor(() => {
          const amountInput = accordionDetails?.querySelector('input[name="approvals.1"]') as HTMLInputElement
          expect(amountInput).not.toBeNull()
          expect(amountInput).toHaveValue('300.0')
          expect(amountInput).toBeEnabled()
        })

        const amountInput = accordionDetails?.querySelector('input[name="approvals.1"]') as HTMLInputElement

        await act(() => {
          fireEvent.change(amountInput!, { target: { value: '456' } })
        })

        await act(() => {
          buttons[1].click()
        })

        await waitFor(() => {
          expect(updateCallback).toHaveBeenCalledWith([
            {
              to: tokenAddress1,
              data: createApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('123', 18))),
              value: '0',
            },
            {
              to: tokenAddress1,
              data: createNonApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('200', 18))),
              value: '0',
            },
            {
              to: tokenAddress2,
              data: createApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('456', 12))),
              value: '0',
            },
          ])
        })
      }
    })

    it('should render and edit single tx', async () => {
      const tokenAddress = hexZeroPad('0x123', 20)
      const mockBalances: SafeBalanceResponse = {
        fiatTotal: '100',
        items: [
          {
            balance: '100',
            fiatBalance: '100',
            fiatConversion: '1',
            tokenInfo: {
              address: tokenAddress,
              decimals: 18,
              logoUri: '',
              name: 'Test',
              symbol: 'TST',
              type: TokenType.ERC20,
            },
          },
        ],
      }
      const txs = [
        {
          to: tokenAddress,
          data: createApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('420', 18))),
          value: '0',
        },
      ]

      const Editor = await renderEditor(txs, updateCallback)

      const result = render(<Editor />, {
        initialReduxState: {
          balances: { data: mockBalances, loading: false },
        },
      })
      await waitFor(() => {
        const accordionSummary = getApprovalSummaryElement(PREFIX_TEXT, result)
        getByText(accordionSummary, '420', { exact: false })
        getByText(accordionSummary, 'TST', { exact: false })
      })

      // Edit tx
      const accordionSummary = getApprovalSummaryElement(PREFIX_TEXT, result)

      const parentContainer = accordionSummary.closest('.MuiPaper-root')
      const accordionDetails = parentContainer?.querySelector('.MuiAccordionDetails-root')
      expect(accordionDetails).not.toBeNull()

      // toggle edit row
      await waitFor(() => {
        const amountInput = accordionDetails?.querySelector('input[name="approvals.0"]') as HTMLInputElement
        expect(amountInput).not.toBeNull()
        expect(amountInput).toHaveValue('420.0')
        expect(amountInput).toBeEnabled()
      })

      const amountInput = accordionDetails?.querySelector('input[name="approvals.0"]') as HTMLInputElement

      await act(() => {
        fireEvent.change(amountInput!, { target: { value: '100' } })
      })

      await act(() => {
        getByRole(accordionDetails as HTMLElement, 'button').click()
      })

      await waitFor(() => {
        expect(updateCallback).toHaveBeenCalledWith([
          {
            to: tokenAddress,
            data: createApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('100', 18))),
            value: '0',
          },
        ])
      })
    })
  })

  // Readonly mode is used in the confirmationsModal
  // It passes decodedTxData and txDetails instead of an array of base transactions and no update function
  describe('in readonly mode', () => {
    describe('should render null', () => {
      it('for a single tx containing no approve call', async () => {
        const txs: BaseTransaction[] = [
          {
            to: hexZeroPad('0x123', 20),
            data: createNonApproveCallData(hexZeroPad('0x2', 20), '20'),
            value: '420',
          },
        ]
        const Editor = await renderEditor(txs)
        const result = render(<Editor />)
        expect(result.container).toBeEmptyDOMElement()
      })

      describe('should render approval(s)', () => {
        it('for single approval tx of token in balances', async () => {
          const tokenAddress = hexZeroPad('0x123', 20)
          const mockBalance: SafeBalanceResponse = {
            fiatTotal: '100',
            items: [
              {
                balance: '100',
                fiatBalance: '100',
                fiatConversion: '1',
                tokenInfo: {
                  address: tokenAddress,
                  decimals: 18,
                  logoUri: '',
                  name: 'Test',
                  symbol: 'TST',
                  type: TokenType.ERC20,
                },
              },
            ],
          }
          const txs: BaseTransaction[] = [
            {
              to: tokenAddress,
              data: createApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('420', 18))),
              value: '0',
            },
          ]

          const Editor = await renderEditor(txs)

          const result = render(<Editor />, {
            initialReduxState: {
              balances: {
                loading: false,
                data: mockBalance,
              },
            },
          })
          await waitFor(() => {
            const accordionSummary = getApprovalSummaryElement(PREFIX_TEXT, result)
            getByText(accordionSummary, '420', { exact: false })
            getByText(accordionSummary, 'TST', { exact: false })
          })
        })
      })
    })
  })
})
