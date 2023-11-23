import { BigNumber } from 'ethers'

import { _RecoveryHeader } from '.'
import { render } from '@/tests/test-utils'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryLoaderContext'

describe('RecoveryHeader', () => {
  it('should not render a widget if the chain does not support recovery', () => {
    const { container } = render(
      <_RecoveryHeader
        isOwner
        isGuardian
        queue={[{ validFrom: BigNumber.from(0) } as RecoveryQueueItem]}
        supportsRecovery={false}
      />,
    )

    expect(container).toBeEmptyDOMElement()
  })

  it('should render the in-progress widget if there is a queue for guardians', () => {
    const { queryByText } = render(
      <_RecoveryHeader
        isOwner={false}
        isGuardian
        queue={[{ validFrom: BigNumber.from(0) } as RecoveryQueueItem]}
        supportsRecovery
      />,
    )

    expect(queryByText('Account recovery in progress')).toBeTruthy()
  })

  it('should render the in-progress widget if there is a queue for owners', () => {
    const { queryByText } = render(
      <_RecoveryHeader
        isOwner
        isGuardian={false}
        queue={[{ validFrom: BigNumber.from(0) } as RecoveryQueueItem]}
        supportsRecovery
      />,
    )

    expect(queryByText('Account recovery in progress')).toBeTruthy()
  })

  it('should render the proposal widget when there is no queue for guardians', () => {
    const { queryByText } = render(<_RecoveryHeader isOwner={false} isGuardian queue={[]} supportsRecovery />)

    expect(queryByText('Recover this Account')).toBeTruthy()
  })

  it('should not render the proposal widget when there is no queue for owners', () => {
    const { container } = render(<_RecoveryHeader isOwner isGuardian={false} queue={[]} supportsRecovery />)

    expect(container).toBeEmptyDOMElement()
  })
})
