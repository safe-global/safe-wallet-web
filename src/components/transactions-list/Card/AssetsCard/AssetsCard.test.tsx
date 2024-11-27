import { render } from '@/src/tests/test-utils'
import { AssetsCard } from '.'

describe('AssetsCard', () => {
  it('should render the default markup', () => {
    const { getByText } = render(<AssetsCard name="Ether" description="some info about the token" />)

    expect(getByText('Ether')).toBeTruthy()
    expect(getByText('some info about the token')).toBeTruthy()
  })

  it('should render the price of the asset', () => {
    const { getByText } = render(<AssetsCard name="Ether" rightNode="200.20" description="some info about the token" />)

    expect(getByText('Ether')).toBeTruthy()
    expect(getByText('some info about the token')).toBeTruthy()
  })
})
