import {
  fireEvent,
  getAllByRole,
  getByRole,
  getByText,
  mockWeb3Provider,
  render,
  type RenderResult,
  waitFor,
} from '@/tests/test-utils'
import ApprovalEditor from '.'
import { type DecodedDataResponse, type SafeBalanceResponse, TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { hexlify, hexZeroPad, Interface } from 'ethers/lib/utils'
import { ERC20__factory, Multi_send__factory } from '@/types/contracts'
import type { BaseTransaction } from '@safe-global/safe-apps-sdk'
import { encodeMultiSendData } from '@safe-global/safe-core-sdk/dist/src/utils/transactions/utils'
import { parseUnits } from '@ethersproject/units'

const PREFIX_TEXT = 'Approve access to'
const ERC20_INTERFACE = ERC20__factory.createInterface()
const MULTISEND_INTERFACE = Multi_send__factory.createInterface()

const createApproveCallData = (spender: string, value: string) => {
  return ERC20_INTERFACE.encodeFunctionData('approve', [spender, value])
}

const createNonApproveCallData = (to: string, value: string) => {
  return ERC20_INTERFACE.encodeFunctionData('transfer', [to, value])
}

const createMultiSendData = (txs: BaseTransaction[]) => {
  return MULTISEND_INTERFACE.encodeFunctionData('multiSend', [encodeMultiSendData(txs)])
}

const getApprovalSummaryElement = (text: string, result: RenderResult): HTMLElement => {
  const accordionSummary = result.getByText(PREFIX_TEXT, { exact: false })
  expect(accordionSummary.parentElement).not.toBeNull()
  return accordionSummary.parentElement!
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
      it('for empty txs', () => {
        const result = render(<ApprovalEditor txs={[]} updateTxs={updateCallback} />)
        expect(result.container).toBeEmptyDOMElement()
      })

      it('for a single tx containing an approve call with wrong params', () => {
        const testInterface = new Interface(['function approve(address, uint256, uint8)'])
        const txs = [
          {
            to: hexZeroPad('0x123', 20),
            data: testInterface.encodeFunctionData('approve', [hexZeroPad('0x2', 20), '123', '1']),
            value: '0',
          },
        ]
        const result = render(<ApprovalEditor txs={txs} updateTxs={updateCallback} />)
        expect(result.container).toBeEmptyDOMElement()
      })

      it('for multiple non approve txs', () => {
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
        const result = render(<ApprovalEditor txs={txs} updateTxs={updateCallback} />)
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
      const result = render(<ApprovalEditor txs={txs} updateTxs={updateCallback} />, {
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
        // edit first transfer
        buttons[0].click()
        await waitFor(() => {
          const amountInput = accordionDetails?.querySelector('input[name="approvals.0"]') as HTMLInputElement
          expect(amountInput).not.toBeNull()
          expect(amountInput).toHaveValue('100.0')
          expect(amountInput).toBeEnabled()
        })

        const amountInput = accordionDetails?.querySelector('input[name="approvals.0"]') as HTMLInputElement

        fireEvent.change(amountInput!, { target: { value: '123' } })
        getAllByRole(accordionDetails as HTMLElement, 'button')[0].click()

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
        // edit first transfer
        buttons[1].click()
        await waitFor(() => {
          const amountInput = accordionDetails?.querySelector('input[name="approvals.1"]') as HTMLInputElement
          expect(amountInput).not.toBeNull()
          expect(amountInput).toHaveValue('300.0')
          expect(amountInput).toBeEnabled()
        })

        const amountInput = accordionDetails?.querySelector('input[name="approvals.1"]') as HTMLInputElement

        fireEvent.change(amountInput!, { target: { value: '456' } })
        getAllByRole(accordionDetails as HTMLElement, 'button')[1].click()

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
      const result = render(<ApprovalEditor txs={txs} updateTxs={updateCallback} />, {
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
      getByRole(accordionDetails as HTMLElement, 'button').click()
      await waitFor(() => {
        const amountInput = accordionDetails?.querySelector('input[name="approvals.0"]') as HTMLInputElement
        expect(amountInput).not.toBeNull()
        expect(amountInput).toHaveValue('420.0')
        expect(amountInput).toBeEnabled()
      })

      const amountInput = accordionDetails?.querySelector('input[name="approvals.0"]') as HTMLInputElement

      fireEvent.change(amountInput!, { target: { value: '100' } })
      getByRole(accordionDetails as HTMLElement, 'button').click()

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
      it('for a single tx containing no approve call', () => {
        const txs: DecodedDataResponse & { to: string } = {
          method: 'transfer',
          to: hexZeroPad('0x123', 20),
          parameters: [
            { name: 'to', type: 'address', value: hexZeroPad('0x2', 20) },
            { name: 'value', type: 'uint256', value: '420' },
          ],
        }
        const result = render(<ApprovalEditor txs={txs} />)
        expect(result.container).toBeEmptyDOMElement()
      })

      it('for a single tx containing an approve call with wrong params', () => {
        const txs: DecodedDataResponse & { to: string } = {
          method: 'approve',
          to: hexZeroPad('0x123', 20),
          parameters: [
            { name: 'value1', type: 'uint256', value: '123' },
            { name: 'value2', type: 'uint256', value: '456' },
          ],
        }
        const result = render(<ApprovalEditor txs={txs} />)
        expect(result.container).toBeEmptyDOMElement()
      })

      it('for a single tx containing approve call with too many params', () => {
        const txs: DecodedDataResponse & { to: string } = {
          method: 'approve',
          to: hexZeroPad('0x123', 20),
          parameters: [
            { name: 'spender', type: 'address', value: hexZeroPad('0x2', 20) },
            { name: 'value', type: 'uint256', value: '420' },
            { name: 'id', type: 'uint256', value: '1' },
          ],
        }
        const result = render(<ApprovalEditor txs={txs} />)
        expect(result.container).toBeEmptyDOMElement()
      })

      it('for multisend txs with a wrong number of parameters', () => {
        const approvalTx = {
          data: createApproveCallData(hexZeroPad('0x2', 20), '10'),
          to: hexZeroPad('0x3', 20),
          operation: 0,
          value: '0',
        } as const

        const txs: DecodedDataResponse & { to: string } = {
          method: 'multiSend',
          to: hexZeroPad('0x123', 20),
          parameters: [
            {
              name: 'transactions',
              type: 'bytes',
              value: createMultiSendData([approvalTx]),
              valueDecoded: [approvalTx],
            },
            { name: 'unexpectedSecondParam', type: 'uint256', value: '420' },
          ],
        }
        const result = render(<ApprovalEditor txs={txs} />)
        expect(result.container).toBeEmptyDOMElement()
      })

      it('for multisend txs contains without approvals', () => {
        const innerTx = {
          data: createNonApproveCallData(hexZeroPad('0x2', 20), '10'),
          to: hexZeroPad('0x3', 20),
          operation: 0,
          value: '0',
        } as const

        const txs: DecodedDataResponse & { to: string } = {
          method: 'multiSend',
          to: hexZeroPad('0x123', 20),
          parameters: [
            {
              name: 'transactions',
              type: 'bytes',
              value: createMultiSendData([innerTx]),
              valueDecoded: [innerTx],
            },
          ],
        }
        const result = render(<ApprovalEditor txs={txs} />)
        expect(result.container).toBeEmptyDOMElement()
      })
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
        const txs: DecodedDataResponse & { to: string } = {
          method: 'approve',
          to: tokenAddress,
          parameters: [
            { name: 'spender', type: 'address', value: hexZeroPad('0x2', 20) },
            { name: 'value', type: 'uint256', value: hexlify(parseUnits('420', 18)) },
          ],
        }
        const result = render(<ApprovalEditor txs={txs} />, {
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

      it('for single approval tx of token outside of balances', async () => {
        mockWeb3Provider([
          {
            returnType: 'uint8',
            returnValue: '8',
            signature: 'decimals()',
          },
          {
            returnType: 'string',
            returnValue: 'TST',
            signature: 'symbol()',
          },
        ])
        const tokenAddress = hexZeroPad('0x123', 20)
        const mockBalance: SafeBalanceResponse = {
          fiatTotal: '0',
          items: [],
        }
        const txs: DecodedDataResponse & { to: string } = {
          method: 'approve',
          to: tokenAddress,
          parameters: [
            { name: 'spender', type: 'address', value: hexZeroPad('0x2', 20) },
            { name: 'value', type: 'uint256', value: hexlify(parseUnits('420', 8)) },
          ],
        }
        const result = render(<ApprovalEditor txs={txs} />, {
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

      it('for multisend tx with one approval of token in balances', async () => {
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
        const approvalTx = {
          data: createApproveCallData(hexZeroPad('0x2', 20), hexlify(parseUnits('69', 18))),
          to: tokenAddress,
          operation: 0,
          value: '0',
        } as const

        const txs: DecodedDataResponse & { to: string } = {
          method: 'multiSend',
          to: hexZeroPad('0x456', 20),
          parameters: [
            {
              name: 'transactions',
              type: 'bytes',
              value: createMultiSendData([approvalTx]),
              valueDecoded: [approvalTx],
            },
          ],
        }
        const result = render(<ApprovalEditor txs={txs} />, {
          initialReduxState: {
            balances: {
              loading: false,
              data: mockBalance,
            },
          },
        })
        await waitFor(() => {
          const accordionSummary = getApprovalSummaryElement(PREFIX_TEXT, result)
          getByText(accordionSummary, '69', { exact: false })
          getByText(accordionSummary, 'TST', { exact: false })
        })
      })
    })
  })
})
