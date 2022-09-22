import { render, screen } from '@/tests/test-utils'
import AppFrame from '@/components/safe-apps/AppFrame'

describe('AppFrame', () => {
  it('should show the transaction queue bar', () => {
    render(<AppFrame appUrl="https://app.url" />)

    expect(screen.getByText('(0) Transaction Queue')).toBeInTheDocument()
  })
})
