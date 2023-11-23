import { BigNumber } from 'ethers'
import { faker } from '@faker-js/faker'
import { renderHook } from '@testing-library/react'
import * as router from 'next/router'

import { render, waitFor } from '@/tests/test-utils'
import { safeInfoBuilder } from '@/tests/builders/safe'
import { connectedWalletBuilder } from '@/tests/builders/wallet'
import * as safeInfo from '@/hooks/useSafeInfo'
import { _useDidDismissProposal } from './index'
import type { RecoveryQueueItem } from '@/components/recovery/RecoveryLoaderContext'

describe('RecoveryModal', () => {
  describe('component', () => {
    // eslint-disable-next-line @typescript-eslint/consistent-type-imports
    let _RecoveryModal: typeof import('./index')._RecoveryModal

    beforeEach(() => {
      localStorage.clear()

      // Clear cache in between tests
      _RecoveryModal = require('./index')._RecoveryModal
    })

    it('should not render the modal if there is a queue but the user is not an owner or guardian', () => {
      const wallet = connectedWalletBuilder().build()
      const queue = [{ validFrom: BigNumber.from(0) } as RecoveryQueueItem]

      const { queryByText } = render(
        <_RecoveryModal wallet={wallet} isOwner={false} isGuardian={false} queue={queue}>
          Test
        </_RecoveryModal>,
      )

      expect(queryByText('Test')).toBeTruthy()
      expect(queryByText('recovery')).toBeFalsy()
    })

    it('should not render the modal if there is no queue and the user is a guardian', () => {
      const wallet = connectedWalletBuilder().build()
      const queue = [] as Array<RecoveryQueueItem>

      const { queryByText } = render(
        <_RecoveryModal wallet={wallet} isOwner={false} isGuardian queue={queue}>
          Test
        </_RecoveryModal>,
      )

      expect(queryByText('Test')).toBeTruthy()
      expect(queryByText('recovery')).toBeFalsy()
    })

    it('should not render the modal if there is no queue and the user is an owner', () => {
      const wallet = connectedWalletBuilder().build()
      const queue = [] as Array<RecoveryQueueItem>

      const { queryByText } = render(
        <_RecoveryModal wallet={wallet} isOwner isGuardian={false} queue={queue}>
          Test
        </_RecoveryModal>,
      )

      expect(queryByText('Test')).toBeTruthy()
      expect(queryByText('recovery')).toBeFalsy()
    })

    it('should render the in-progress modal when there is a queue for guardians', () => {
      const wallet = connectedWalletBuilder().build()
      const queue = [{ validFrom: BigNumber.from(0) } as RecoveryQueueItem]

      const { queryByText } = render(
        <_RecoveryModal wallet={wallet} isOwner={false} isGuardian queue={queue}>
          Test
        </_RecoveryModal>,
      )

      expect(queryByText('Test')).toBeTruthy()
      expect(queryByText('Account recovery in progress')).toBeTruthy()
    })

    it('should render the in-progress modal when there is a queue for owners', () => {
      const wallet = connectedWalletBuilder().build()
      const queue = [{ validFrom: BigNumber.from(0) } as RecoveryQueueItem]

      const { queryByText } = render(
        <_RecoveryModal wallet={wallet} isOwner isGuardian={false} queue={queue}>
          Test
        </_RecoveryModal>,
      )

      expect(queryByText('Test')).toBeTruthy()
      expect(queryByText('Account recovery in progress')).toBeTruthy()
    })

    it('should render the proposal modal when there is no queue for guardians', () => {
      const wallet = connectedWalletBuilder().build()
      const queue = [] as Array<RecoveryQueueItem>

      const { queryByText } = render(
        <_RecoveryModal wallet={wallet} isOwner={false} isGuardian queue={queue}>
          Test
        </_RecoveryModal>,
      )

      expect(queryByText('Test')).toBeTruthy()
      expect(queryByText('Recover this Account')).toBeTruthy()
    })

    it('should not render the proposal modal when there is no queue for owners', () => {
      const wallet = connectedWalletBuilder().build()
      const queue = [] as Array<RecoveryQueueItem>

      const { queryByText } = render(
        <_RecoveryModal wallet={wallet} isOwner isGuardian={false} queue={queue}>
          Test
        </_RecoveryModal>,
      )

      expect(queryByText('Test')).toBeTruthy()
      expect(queryByText('Recover this Account')).toBeFalsy()
    })

    it('should close the modal when the user navigates away', async () => {
      const mockUseRouter = {
        push: jest.fn(),
        query: {},
        events: {
          on: jest.fn(),
          off: jest.fn(),
        },
      }

      jest.spyOn(router, 'useRouter').mockReturnValue(mockUseRouter as any)

      const wallet = connectedWalletBuilder().build()
      const queue = [{ validFrom: BigNumber.from(0), transactionHash: faker.string.hexadecimal() } as RecoveryQueueItem]

      const { queryByText } = render(
        <_RecoveryModal wallet={wallet} isOwner isGuardian={false} queue={queue}>
          Test
        </_RecoveryModal>,
      )

      expect(queryByText('Test')).toBeTruthy()
      expect(queryByText('Account recovery in progress')).toBeTruthy()

      // Trigger the route change
      mockUseRouter.events.on.mock.calls[0][1]()

      await waitFor(() => {
        expect(queryByText('Account recovery in progress')).toBeFalsy()
      })
    })
  })

  describe('hooks', () => {
    beforeEach(() => {
      localStorage.clear()

      const safe = safeInfoBuilder().build()
      jest
        .spyOn(safeInfo, 'default')
        .mockReturnValue({ safe, safeAddress: safe.address.value } as ReturnType<typeof safeInfo.default>)
    })

    describe('useDidDismissProposal', () => {
      it('should return false if the proposal was not dismissed before', () => {
        const guardianAddress = faker.finance.ethereumAddress()

        const { result } = renderHook(() => _useDidDismissProposal())

        expect(result.current.wasProposalDismissed(guardianAddress)).toBeFalsy()
      })

      it('should return true if the proposal was dismissed before', () => {
        const guardianAddress = faker.finance.ethereumAddress()

        const { result, rerender } = renderHook(() => _useDidDismissProposal())

        expect(result.current.wasProposalDismissed(guardianAddress)).toBeFalsy()
        result.current.dismissProposal(guardianAddress)

        rerender()

        expect(result.current.wasProposalDismissed(guardianAddress)).toBeTruthy()
      })

      it('should persist dismissals between sessions', () => {
        const guardianAddress = faker.finance.ethereumAddress()

        const firstRender = renderHook(() => _useDidDismissProposal())

        expect(firstRender.result.current.wasProposalDismissed(guardianAddress)).toBeFalsy()
        firstRender.result.current.dismissProposal(guardianAddress)

        firstRender.rerender()

        expect(firstRender.result.current.wasProposalDismissed(guardianAddress)).toBeTruthy()

        firstRender.unmount()

        const secondRender = renderHook(() => _useDidDismissProposal())
        expect(secondRender.result.current.wasProposalDismissed(guardianAddress)).toBeTruthy()
      })
    })

    describe('useDidDismissInProgress', () => {
      // eslint-disable-next-line @typescript-eslint/consistent-type-imports
      let _useDidDismissInProgress: typeof import('./index')._useDidDismissInProgress

      beforeEach(() => {
        localStorage.clear()

        // Clear cache in between tests
        _useDidDismissInProgress = require('./index')._useDidDismissInProgress
      })

      it('should return false if in-progress was not dismissed before', () => {
        const guardianAddress = faker.finance.ethereumAddress()

        const { result } = renderHook(() => _useDidDismissInProgress())

        expect(result.current.wasInProgressDismissed(guardianAddress)).toBeFalsy()
      })

      it('should return true if in-progress was not dismissed before', () => {
        const guardianAddress = faker.finance.ethereumAddress()

        const { result } = renderHook(() => _useDidDismissInProgress())

        expect(result.current.wasInProgressDismissed(guardianAddress)).toBeFalsy()
        result.current.dismissInProgress(guardianAddress)
        expect(result.current.wasInProgressDismissed(guardianAddress)).toBeTruthy()
      })

      it('should not persist dismissals between sessions', () => {
        const guardianAddress = faker.finance.ethereumAddress()

        const firstRender = renderHook(() => _useDidDismissInProgress())

        expect(firstRender.result.current.wasInProgressDismissed(guardianAddress)).toBeFalsy()
        firstRender.result.current.dismissInProgress(guardianAddress)
        expect(firstRender.result.current.wasInProgressDismissed(guardianAddress)).toBeTruthy()

        firstRender.unmount()

        const secondRender = renderHook(() => _useDidDismissInProgress())
        expect(secondRender.result.current.wasInProgressDismissed(guardianAddress)).toBeFalsy()
      })
    })
  })
})
