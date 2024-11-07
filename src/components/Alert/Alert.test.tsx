import { render } from '@/src/tests/test-utils'
import { Alert } from '.'
import { SafeFontIcon } from '../SafeFontIcon/SafeFontIcon'

describe('Alert', () => {
  it('should render a info alert', () => {
    const container = render(<Alert type="info" message="Info alert" />)

    expect(container).toMatchSnapshot()
  })

  it('should render a warning alert', () => {
    const container = render(<Alert type="warning" message="Warning alert" />)

    expect(container).toMatchSnapshot()
  })

  it('should render an error alert', () => {
    const container = render(<Alert type="error" message="Error alert" />)

    expect(container).toMatchSnapshot()
  })

  it('should render an alert with start icon', () => {
    const container = render(<Alert type="error" startIcon={<SafeFontIcon name="add-owner" />} message="Error alert" />)

    expect(container).toMatchSnapshot()
  })

  it('should render an alert with an end icon', () => {
    const container = render(<Alert type="error" endIcon={<SafeFontIcon name="add-owner" />} message="Error alert" />)

    expect(container).toMatchSnapshot()
  })

  it('should render an alert with a name icon', () => {
    const container = render(<Alert type="error" iconName="add-owner" message="Error alert" />)

    expect(container).toMatchSnapshot()
  })
})
