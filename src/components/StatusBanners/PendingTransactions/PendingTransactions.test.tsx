import { render } from '@/src/tests/test-utils'
import PendingTransactions from '.'

describe('PendingTransactions', () => {
  it('should render the default markup', () => {
    const container = render(<PendingTransactions number={'2'} onPress={jest.fn()} />)

    expect(container).toMatchSnapshot()
  })

  it('should render the pending transactions in fullWidth layout', () => {
    const container = render(<PendingTransactions number={'2'} fullWidth onPress={jest.fn()} />)

    expect(container).toMatchSnapshot()
  })
})
