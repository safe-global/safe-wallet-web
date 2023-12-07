import SignOrExecuteForm from '@/components/tx/SignOrExecuteForm'
import { render } from '@/tests/test-utils'

describe('SignOrExecute', () => {
  it('renders without crashing', () => {
    const result = render(<SignOrExecuteForm onSubmit={jest.fn()} />)
  })
})
