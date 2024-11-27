import { render } from '@/src/tests/test-utils'
import { Logo } from '.'

describe('Logo', () => {
  it('should render the default markup', () => {
    const container = render(<Logo logoUri="http://something.com/my-image.png" accessibilityLabel="Mocked logo" />)

    expect(container.getByLabelText('Mocked logo')).toBeTruthy()
  })

  it('should render the fallback markup', () => {
    const container = render(<Logo />)

    expect(container.queryByTestId('logo-image')).not.toBeTruthy()
    expect(container.queryByTestId('logo-fallback-icon')).toBeTruthy()
  })
})
