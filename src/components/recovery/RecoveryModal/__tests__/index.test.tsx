import { BigNumber } from 'ethers'
import * as router from 'next/router'

import { render, waitFor } from '@/tests/test-utils'
import { _RecoveryModal } from '..'
import type { RecoveryQueueItem } from '@/store/recoverySlice'

describe('RecoveryModal', () => {
  it('should not render the modal if there is a queue but the user is not an owner or guardian', () => {
    const { queryByText } = render(
      <_RecoveryModal
        isOwner={false}
        isGuardian={false}
        queue={[{ validFrom: BigNumber.from(0) } as RecoveryQueueItem]}
      >
        Test
      </_RecoveryModal>,
    )

    expect(queryByText('Test')).toBeTruthy()
    expect(queryByText('recovery')).toBeFalsy()
  })

  it('should not render the modal if there is no queue user and the user is a guardian', () => {
    const { queryByText } = render(
      <_RecoveryModal isOwner={false} isGuardian queue={[]}>
        Test
      </_RecoveryModal>,
    )

    expect(queryByText('Test')).toBeTruthy()
    expect(queryByText('recovery')).toBeFalsy()
  })

  it('should not render the modal if there is no queue user and the user is an owner', () => {
    const { queryByText } = render(
      <_RecoveryModal isOwner isGuardian={false} queue={[]}>
        Test
      </_RecoveryModal>,
    )

    expect(queryByText('Test')).toBeTruthy()
    expect(queryByText('recovery')).toBeFalsy()
  })

  it('should render the in-progress modal when there is a queue for guardians', () => {
    const { queryByText } = render(
      <_RecoveryModal isOwner={false} isGuardian queue={[{ validFrom: BigNumber.from(0) } as RecoveryQueueItem]}>
        Test
      </_RecoveryModal>,
    )

    expect(queryByText('Test')).toBeTruthy()
    expect(queryByText('Account recovery in progress')).toBeTruthy()
  })

  it('should render the in-progress modal when there is a queue for owners', () => {
    const { queryByText } = render(
      <_RecoveryModal isOwner isGuardian={false} queue={[{ validFrom: BigNumber.from(0) } as RecoveryQueueItem]}>
        Test
      </_RecoveryModal>,
    )

    expect(queryByText('Test')).toBeTruthy()
    expect(queryByText('Account recovery in progress')).toBeTruthy()
  })

  it('should render the proposal modal when there is no queue for guardians', () => {
    const { queryByText } = render(
      <_RecoveryModal isOwner={false} isGuardian queue={[]}>
        Test
      </_RecoveryModal>,
    )

    expect(queryByText('Test')).toBeTruthy()
    expect(queryByText('Recover this Account')).toBeTruthy()
  })

  it('should close the modal when the user navigates away', async () => {
    let onClose = () => {}

    jest.spyOn(router, 'useRouter').mockImplementation(
      () =>
        ({
          events: {
            on: jest.fn((_, callback) => {
              onClose = callback
            }),
          },
        } as any),
    )

    const { queryByText } = render(
      <_RecoveryModal isOwner isGuardian={false} queue={[{ validFrom: BigNumber.from(0) } as RecoveryQueueItem]}>
        Test
      </_RecoveryModal>,
    )

    expect(queryByText('Test')).toBeTruthy()
    expect(queryByText('Account recovery in progress')).toBeTruthy()

    onClose()

    await waitFor(() => {
      expect(queryByText('Account recovery in progress')).toBeFalsy()
    })
  })
})
