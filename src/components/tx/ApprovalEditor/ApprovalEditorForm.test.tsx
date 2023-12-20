import { fireEvent, render, waitFor } from '@/tests/test-utils'
import { hexZeroPad } from 'ethers/lib/utils'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { ApprovalEditorForm } from '@/components/tx/ApprovalEditor/ApprovalEditorForm'
import { getAllByTestId, getAllByTitle } from '@testing-library/dom'
import type { ApprovalInfo } from './hooks/useApprovalInfos'

describe('ApprovalEditorForm', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const updateCallback = jest.fn()

  it('should render and edit multiple txs', async () => {
    const tokenAddress1 = hexZeroPad('0x123', 20)
    const tokenAddress2 = hexZeroPad('0x234', 20)

    const mockApprovalInfos: ApprovalInfo[] = [
      {
        tokenInfo: { symbol: 'TST', decimals: 18, address: tokenAddress1, type: TokenType.ERC20 },
        tokenAddress: '0x1',
        spender: '0x2',
        amount: '4200000',
        amountFormatted: '420.0',
        method: 'approve',
      },
      {
        tokenInfo: { symbol: 'TST', decimals: 18, address: tokenAddress2, type: TokenType.ERC20 },
        tokenAddress: '0x1',
        spender: '0x2',
        amount: '6900000',
        amountFormatted: '69.0',
        method: 'increaseAllowance',
      },
    ]

    const result = render(<ApprovalEditorForm approvalInfos={mockApprovalInfos} updateApprovals={updateCallback} />)

    // All approvals are rendered
    const approvalItems = getAllByTestId(result.container, 'approval-item')
    expect(approvalItems).toHaveLength(2)

    // One button for each approval
    const buttons = getAllByTitle(result.container, 'Save')
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

    const mockApprovalInfo: ApprovalInfo = {
      tokenInfo: { symbol: 'TST', decimals: 18, address: tokenAddress, type: TokenType.ERC20 },
      tokenAddress: '0x1',
      spender: '0x2',
      amount: '4200000',
      amountFormatted: '420.0',
      method: 'approve',
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
    const saveButton = result.getByTitle('Save')

    fireEvent.change(amountInput!, { target: { value: '100' } })
    fireEvent.click(saveButton)

    expect(updateCallback).toHaveBeenCalledWith(['100'])
  })
})
