import { _DisclaimerWrapper, DisclaimerWrapper } from '@/components/wrappers/DisclaimerWrapper'
import { act, render } from '@/tests/test-utils'

describe('DisclaimerWrapper', () => {
  it('should render children if consent is given', () => {
    const { queryByText } = render(
      <_DisclaimerWrapper localStorageKey="key" widgetName="name" getLocalStorage={() => [true as any, () => {}]}>
        <>Consent given</>
      </_DisclaimerWrapper>,
    )

    expect(queryByText('Consent given')).toBeTruthy()
  })

  it('should not render children if consent is not given', () => {
    const { queryByText } = render(
      <_DisclaimerWrapper localStorageKey="key" widgetName="name" getLocalStorage={() => [false as any, () => {}]}>
        <>Consent given</>
      </_DisclaimerWrapper>,
    )

    expect(queryByText('Consent given')).toBeFalsy()
  })

  it('should render children if disclaimer is accepted', () => {
    const { getByText, queryByText } = render(
      <DisclaimerWrapper localStorageKey="key" widgetName="name">
        <>Consent given</>
      </DisclaimerWrapper>,
    )

    expect(queryByText('Consent given')).toBeFalsy()

    act(() => {
      getByText('Continue').click()
    })

    expect(queryByText('Consent given')).toBeTruthy()
  })
})
