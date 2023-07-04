import { fireEvent, getAllByRole, render, waitFor } from '@/tests/test-utils'
import ApprovalEditor from '.'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { hexZeroPad, Interface } from 'ethers/lib/utils'
import { ERC20__factory, Multi_send_call_only__factory } from '@/types/contracts'
import type { BaseTransaction } from '@safe-global/safe-apps-sdk'
import { encodeMultiSendData } from '@safe-global/safe-core-sdk/dist/src/utils/transactions/utils'
import { getMultiSendCallOnlyContractAddress } from '@/services/contracts/safeContracts'
import { type SafeSignature, type SafeTransaction } from '@safe-global/safe-core-sdk-types'
import { getAllByTestId } from '@testing-library/dom'
import { ApprovalEditorForm } from '@/components/tx/ApprovalEditor/ApprovalEditorForm'
import Approvals from '@/components/tx/ApprovalEditor/Approvals'

const ERC20_INTERFACE = ERC20__factory.createInterface()

const createNonApproveCallData = (to: string, value: string) => {
  return ERC20_INTERFACE.encodeFunctionData('transfer', [to, value])
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

    it('should render and edit multiple txs', async () => {
      const tokenAddress1 = hexZeroPad('0x123', 20)
      const tokenAddress2 = hexZeroPad('0x234', 20)

      const mockApprovalInfos = [
        {
          tokenInfo: { symbol: 'TST', decimals: 18, address: tokenAddress1, type: TokenType.ERC20 },
          tokenAddress: '0x1',
          spender: '0x2',
          amount: '4200000',
          amountFormatted: '420.0',
        },
        {
          tokenInfo: { symbol: 'TST', decimals: 18, address: tokenAddress2, type: TokenType.ERC20 },
          tokenAddress: '0x1',
          spender: '0x2',
          amount: '6900000',
          amountFormatted: '69.0',
        },
      ]

      const result = render(<ApprovalEditorForm approvalInfos={mockApprovalInfos} updateApprovals={updateCallback} />)

      // All approvals are rendered
      const approvalItems = getAllByTestId(result.container, 'approval-item')
      expect(approvalItems).toHaveLength(2)

      // One button for each approval
      const buttons = getAllByRole(result.container, 'button')
      expect(buttons).toHaveLength(2)

      // First approval value is rendered
      await waitFor(() => {
        const amountInput = result.container.querySelector('input[name="approvals.0"]') as HTMLInputElement
        expect(amountInput).not.toBeNull()
        expect(amountInput).toHaveValue('420.0')
        expect(amountInput).toBeEnabled()
      })

      // Change value of first approval
      const amountInput1 = result.container.querySelector('input[name="approvals.0"]') as HTMLInputElement
      fireEvent.change(amountInput1!, { target: { value: '123' } })
      fireEvent.click(buttons[0])

      expect(updateCallback).toHaveBeenCalledWith(['123', '69.0'])

      // Second approval value is rendered
      await waitFor(() => {
        const amountInput = result.container.querySelector('input[name="approvals.1"]') as HTMLInputElement
        expect(amountInput).not.toBeNull()
        expect(amountInput).toHaveValue('69.0')
        expect(amountInput).toBeEnabled()
      })

      // Change value of second approval
      const amountInput2 = result.container.querySelector('input[name="approvals.1"]') as HTMLInputElement
      fireEvent.change(amountInput2!, { target: { value: '456' } })
      fireEvent.click(buttons[1])

      expect(updateCallback).toHaveBeenCalledWith(['123', '456'])
    })

    it('should render and edit single tx', async () => {
      const tokenAddress = hexZeroPad('0x123', 20)

      const mockApprovalInfo = {
        tokenInfo: { symbol: 'TST', decimals: 18, address: tokenAddress, type: TokenType.ERC20 },
        tokenAddress: '0x1',
        spender: '0x2',
        amount: '4200000',
        amountFormatted: '420.0',
      }

      const result = render(<ApprovalEditorForm approvalInfos={[mockApprovalInfo]} updateApprovals={updateCallback} />)

      // Approval item is rendered
      const approvalItem = result.getByTestId('approval-item')
      expect(approvalItem).not.toBeNull()

      // Input with correct value is rendered
      await waitFor(() => {
        const amountInput = result.container.querySelector('input[name="approvals.0"]') as HTMLInputElement
        expect(amountInput).not.toBeNull()
        expect(amountInput).toHaveValue('420.0')
        expect(amountInput).toBeEnabled()
      })

      // Change value and save
      const amountInput = result.container.querySelector('input[name="approvals.0"]') as HTMLInputElement
      const saveButton = result.getByRole('button')

      fireEvent.change(amountInput!, { target: { value: '100' } })
      fireEvent.click(saveButton)

      expect(updateCallback).toHaveBeenCalledWith(['100'])
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

          const mockApprovalInfo = {
            tokenInfo: { symbol: 'TST', decimals: 18, address: tokenAddress, type: TokenType.ERC20 },
            tokenAddress: '0x1',
            spender: '0x2',
            amount: '100',
            amountFormatted: '0.1',
          }

          const result = render(<Approvals approvalInfos={[mockApprovalInfo]} />)

          const approvalItem = result.getByTestId('approval-item')

          expect(approvalItem).toBeInTheDocument()
          expect(approvalItem).toHaveTextContent('Token')
          expect(approvalItem).toHaveTextContent('TST')
          expect(approvalItem).toHaveTextContent('0.1')
        })
      })
    })
  })
})
