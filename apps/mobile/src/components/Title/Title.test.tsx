import { render } from '@/src/tests/test-utils'
import { LargeHeaderTitle } from './LargeHeaderTitle'
import { NavBarTitle } from './NavBarTitle'

describe('LargeHeaderTitle', () => {
  it('should render the default markup', () => {
    const { getByText } = render(<LargeHeaderTitle>Here is my large header</LargeHeaderTitle>)

    expect(getByText('Here is my large header')).toBeTruthy()
  })
})

describe('NavBarTitle', () => {
  it('should render the default markup', () => {
    const { getByText } = render(<NavBarTitle>Here is my NabBarTitle</NavBarTitle>)

    expect(getByText('Here is my NabBarTitle')).toBeTruthy()
  })
})
