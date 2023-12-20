import { safeSignatureBuilder, safeTxBuilder } from '@/tests/builders/safeTx'
import { render } from '@/tests/test-utils'
import ApprovalEditor from '.'
import { TokenType } from '@safe-global/safe-gateway-typescript-sdk'
import { OperationType } from '@safe-global/safe-core-sdk-types'
import * as approvalInfos from '@/components/tx/ApprovalEditor/hooks/useApprovalInfos'
import { createMockSafeTransaction } from '@/tests/transactions'

describe('ApprovalEditor', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null if there is no safe transaction', () => {
    const result = render(<ApprovalEditor safeTransaction={undefined} />)

    expect(result.container).toBeEmptyDOMElement()
  })

  it('returns null if there are no approvals', () => {
    const mockSafeTx = createMockSafeTransaction({ to: '0x1', data: '0x', operation: OperationType.DelegateCall })
    jest.spyOn(approvalInfos, 'useApprovalInfos').mockReturnValue([[], undefined, false])
    const result = render(<ApprovalEditor safeTransaction={mockSafeTx} />)

    expect(result.container).toBeEmptyDOMElement()
  })

  it('renders an error', async () => {
    jest
      .spyOn(approvalInfos, 'useApprovalInfos')
      .mockReturnValue([undefined, new Error('Error parsing approvals'), false])
    const mockSafeTx = createMockSafeTransaction({ to: '0x1', data: '0x', operation: OperationType.DelegateCall })

    const result = render(<ApprovalEditor safeTransaction={mockSafeTx} />)

    expect(await result.queryByText('Error while decoding approval transactions.')).toBeInTheDocument()
  })

  it('renders a loading skeleton', async () => {
    jest.spyOn(approvalInfos, 'useApprovalInfos').mockReturnValue([undefined, undefined, true])
    const mockSafeTx = createMockSafeTransaction({ to: '0x1', data: '0x', operation: OperationType.DelegateCall })

    const result = render(<ApprovalEditor safeTransaction={mockSafeTx} />)

    expect(await result.queryByTestId('approval-editor-loading')).toBeInTheDocument()
  })

  it('renders a read-only view if the transaction contains signatures', async () => {
    const mockApprovalInfo = {
      tokenInfo: { symbol: 'TST', decimals: 18, address: '0x3', type: TokenType.ERC20 },
      tokenAddress: '0x1',
      spender: '0x2',
      amount: '4200000',
      amountFormatted: '420.0',
      method: 'approve',
    } as const
    jest.spyOn(approvalInfos, 'useApprovalInfos').mockReturnValue([[mockApprovalInfo], undefined, false])
    const mockSafeTx = safeTxBuilder()
      .with({
        signatures: new Map().set('0x1', safeSignatureBuilder().build()),
      })
      .build()

    const result = render(<ApprovalEditor safeTransaction={mockSafeTx} />)

    const amountInput = result.container.querySelector('input[name="approvals.0"]') as HTMLInputElement

    expect(amountInput).not.toBeInTheDocument()
    expect(result.getByText('TST'))
    expect(result.getByText('420'))
    expect(result.getByText('0x2'))
  })

  it('renders a form if there are no signatures', async () => {
    const mockApprovalInfo = {
      tokenInfo: { symbol: 'TST', decimals: 18, address: '0x3', type: TokenType.ERC20 },
      tokenAddress: '0x1',
      spender: '0x2',
      amount: '4200000',
      amountFormatted: '420.0',
      method: 'approve',
    } as const
    jest.spyOn(approvalInfos, 'useApprovalInfos').mockReturnValue([[mockApprovalInfo], undefined, false])
    const mockSafeTx = createMockSafeTransaction({ to: '0x1', data: '0x', operation: OperationType.DelegateCall })

    const result = render(<ApprovalEditor safeTransaction={mockSafeTx} />)

    const amountInput1 = result.container.querySelector('input[name="approvals.0"]') as HTMLInputElement

    expect(amountInput1).toBeInTheDocument

    expect(amountInput1).toHaveValue('420.0')
    expect(result.getByText('TST'))
    expect(result.getByText('0x2'))
  })

  it('renders a form if there is an update callback', async () => {
    const mockApprovalInfo = {
      tokenInfo: { symbol: 'TST', decimals: 18, address: '0x3', type: TokenType.ERC20 },
      tokenAddress: '0x1',
      spender: '0x2',
      amount: '4200000',
      amountFormatted: '420.0',
      method: 'approve',
    } as const
    jest.spyOn(approvalInfos, 'useApprovalInfos').mockReturnValue([[mockApprovalInfo], undefined, false])
    const mockSafeTx = createMockSafeTransaction({ to: '0x1', data: '0x', operation: OperationType.DelegateCall })

    const result = render(<ApprovalEditor safeTransaction={mockSafeTx} />)

    const amountInput = result.container.querySelector('input[name="approvals.0"]') as HTMLInputElement

    expect(amountInput).toBeInTheDocument()
  })
})
