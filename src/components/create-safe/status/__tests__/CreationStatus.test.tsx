import { CreationStatus } from '@/components/create-safe/status/CreationStatus'
import { render } from '@/tests/test-utils'
import type { PendingSafeData } from '@/components/create-safe'

describe('CreationStatus', () => {
  it('should display an AWAITING message by default', () => {
    const mockParams: PendingSafeData = {
      address: '',
      name: '',
      owners: [],
      saltNonce: 0,
      threshold: 0,
      safeAddress: '0x1',
    }
    const { getByText } = render(
      <CreationStatus params={mockParams} onSubmit={jest.fn} onBack={jest.fn} setStep={jest.fn} />,
    )

    expect(getByText('Step 1/2: Waiting for transaction confirmation.')).toBeInTheDocument()
  })

  it.todo('should display the txHash if it exists')
  it.todo('should display the safe address if it exists')
  it.todo('should display a link to the safe on INDEX_FAILED')
  it.todo('should display a retry button on ERROR')
  it.todo('should display a retry button on REVERTED')
  it.todo('should display a retry button on TIMEOUT')
  it.todo('should display a retry button on WALLET_REJECTED')
})
