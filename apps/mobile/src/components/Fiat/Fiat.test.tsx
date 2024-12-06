import { render } from '@/src/tests/test-utils'
import { Fiat } from '.'

describe('Fiat', () => {
  it('should render the default markup', () => {
    const { getByText } = render(<Fiat baseAmount="215,531.65" />)

    expect(getByText('$')).toBeTruthy()
    expect(getByText('215,531')).toBeTruthy()
    expect(getByText('.65')).toBeTruthy()
  })
})
