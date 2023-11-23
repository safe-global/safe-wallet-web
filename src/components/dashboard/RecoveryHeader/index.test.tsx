import { BigNumber } from 'ethers'

import { _RecoveryHeader } from '.'
import { render } from '@/tests/test-utils'
import { RecoveryContext } from '@/components/recovery/RecoveryContext'

describe('RecoveryHeader', () => {
  it('should not render a widget if the chain does not support recovery', () => {
    const queue = [{ validFrom: BigNumber.from(0) }] as any

    const { container } = render(
      <RecoveryContext.Provider value={{ state: [[{ queue }]] } as any}>
        <_RecoveryHeader isOwner isGuardian queue={queue} supportsRecovery={false} />
      </RecoveryContext.Provider>,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('should render the in-progress widget if there is a queue for guardians', () => {
    const queue = [{ validFrom: BigNumber.from(0) }] as any

    const { queryByText } = render(
      <RecoveryContext.Provider value={{ state: [[{ queue }]] } as any}>
        <_RecoveryHeader isOwner={false} isGuardian queue={queue} supportsRecovery />
      </RecoveryContext.Provider>,
    )

    expect(queryByText('Account recovery in progress')).toBeTruthy()
  })

  it('should render the in-progress widget if there is a queue for owners', () => {
    const queue = [{ validFrom: BigNumber.from(0) }] as any

    const { queryByText } = render(
      <RecoveryContext.Provider value={{ state: [[{ queue }]] } as any}>
        <_RecoveryHeader isOwner isGuardian={false} queue={queue} supportsRecovery />
      </RecoveryContext.Provider>,
    )

    expect(queryByText('Account recovery in progress')).toBeTruthy()
  })

  it('should render the proposal widget when there is no queue for guardians', () => {
    const queue = [] as any

    const { queryByText } = render(
      <RecoveryContext.Provider value={{ state: [[{ queue }]] } as any}>
        <_RecoveryHeader isOwner={false} isGuardian queue={queue} supportsRecovery />
      </RecoveryContext.Provider>,
    )

    expect(queryByText('Recover this Account')).toBeTruthy()
  })

  it('should not render the proposal widget when there is no queue for owners', () => {
    const queue = [] as any

    const { container } = render(
      <RecoveryContext.Provider value={{ state: [[{ queue }]] } as any}>
        <_RecoveryHeader isOwner isGuardian={false} queue={queue} supportsRecovery />
      </RecoveryContext.Provider>,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
