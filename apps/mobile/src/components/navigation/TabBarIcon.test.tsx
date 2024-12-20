import { render } from '@/src/tests/test-utils'
import { TabBarIcon } from './TabBarIcon'

describe('TabBarIcon', () => {
  it('should render the default markup', () => {
    const { getByTestId } = render(<TabBarIcon name="add-owner" />)

    expect(getByTestId('tab-bar-add-owner-icon')).toBeTruthy()
  })
})
