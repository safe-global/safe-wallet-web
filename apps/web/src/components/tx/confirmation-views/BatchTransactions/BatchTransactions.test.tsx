import { render } from '@/tests/test-utils'
import BatchTransactions from '.'
import * as useDraftBatch from '@/hooks/useDraftBatch'
import { mockedDarftBatch } from './mockData'

jest.spyOn(useDraftBatch, 'useDraftBatch').mockImplementation(() => mockedDarftBatch)

describe('BatchTransactions', () => {
  it('should render a list of batch transactions', () => {
    const { container, getByText } = render(<BatchTransactions />)

    expect(container).toMatchSnapshot()
    expect(getByText('GnosisSafeProxy')).toBeDefined()
  })
})
