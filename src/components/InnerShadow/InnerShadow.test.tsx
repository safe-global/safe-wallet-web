import { render } from '@/src/tests/test-utils'
import { InnerShadow } from '.'

describe('InnerShadow', () => {
  it('should render the default markup', () => {
    const container = render(<InnerShadow />)

    expect(container).toMatchSnapshot()
  })
})
