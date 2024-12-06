import { render } from '@/src/tests/test-utils'
import { TxSwapCard } from '.'
import { OrderTransactionInfo } from '@/src/store/gateway/types'
import { mockSwapTransfer } from '@/src/tests/mocks'

describe('TxSwapCard', () => {
  it('should render the default markup', () => {
    const container = render(<TxSwapCard txInfo={mockSwapTransfer as OrderTransactionInfo} />)

    expect(container).toMatchSnapshot()
  })
})
