import { render } from '../test-utils'
import TransactionsIndexPage from '../../pages/transactions'
import routerHooks from 'next/router'
import * as queueHooks from '@/hooks/useTxQueue'

describe('Transactions page', () => {
  it('should redirect to History when no queued txs', () => {
    jest.spyOn(queueHooks, 'default').mockImplementation(() => ({
      page: { results: [] },
    }))

    const pushMock = jest.fn()

    // @ts-ignore
    jest.spyOn(routerHooks, 'useRouter').mockImplementation(() => ({
      query: { safe: '0x123' },
      push: pushMock,
    }))

    render(<TransactionsIndexPage />)

    expect(pushMock).toHaveBeenCalledWith({ pathname: '/transactions/history', query: { safe: '0x123' } })
  })

  it('should redirect to Queue when there are queued txs', () => {
    // @ts-ignore
    jest.spyOn(queueHooks, 'default').mockImplementation(() => ({
      page: { results: ['hello'] },
    }))

    const pushMock = jest.fn()

    // @ts-ignore
    jest.spyOn(routerHooks, 'useRouter').mockImplementation(() => ({
      query: { safe: '0x123' },
      push: pushMock,
    }))

    render(<TransactionsIndexPage />)

    expect(pushMock).toHaveBeenCalledWith({ pathname: '/transactions/queue', query: { safe: '0x123' } })
  })
})
