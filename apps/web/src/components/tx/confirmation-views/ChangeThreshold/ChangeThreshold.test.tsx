import { render } from '@/tests/test-utils'
import ChangeThreshold from '.'
import { ChangeThresholdReviewContext } from '@/components/tx-flow/flows/ChangeThreshold/context'
import * as useSafeInfo from '@/hooks/useSafeInfo'
import { extendedSafeInfoBuilder } from '@/tests/builders/safe'

const extendedSafeInfo = extendedSafeInfoBuilder().build()

jest.spyOn(useSafeInfo, 'default').mockImplementation(() => ({
  safeAddress: 'eth:0xA77DE01e157f9f57C7c4A326eeE9C4874D0598b6',
  safe: {
    ...extendedSafeInfo,
    owners: [extendedSafeInfo.owners[0]],
  },
  safeError: undefined,
  safeLoading: false,
  safeLoaded: true,
}))

describe('ChangeThreshold', () => {
  it('should display the ChangeThreshold component with the new threshold range', () => {
    const { container, getByLabelText } = render(
      <ChangeThresholdReviewContext.Provider value={{ newThreshold: 3 }}>
        <ChangeThreshold />
      </ChangeThresholdReviewContext.Provider>,
    )

    expect(container).toMatchSnapshot()
    expect(getByLabelText('threshold')).toHaveTextContent('3 out of 1 signer')
  })
})
