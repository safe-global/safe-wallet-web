import { renderHook, act } from '@/src/tests/test-utils'
import { useAppSelector, useAppDispatch } from '.'
import { addTx, txHistorySelector } from '../txHistorySlice'
import { mockListItemByType } from '@/src/tests/mocks'
import { TransactionListItemType } from '@safe-global/safe-gateway-typescript-sdk'

const mockHook = () => {
  const dispatch = useAppDispatch()
  const historyList = useAppSelector(txHistorySelector)

  return { dispatch, historyList }
}

describe('React Redux Hooks', () => {
  it(`shuold dispatch an action to a slice`, () => {
    const { result } = renderHook(() => mockHook())

    expect(result.current.historyList.results).toHaveLength(0)

    act(() => {
      result.current.dispatch(
        addTx({
          item: mockListItemByType(TransactionListItemType.TRANSACTION),
        }),
      )
    })

    expect(result.current.historyList.results).toHaveLength(1)
  })
})
