import { render } from '@/src/tests/test-utils'
import { TxGroupedCard } from '.'
import { mockERC20Transfer, mockListItemByType, mockNFTTransfer, mockSwapTransfer } from '@/src/tests/mocks'
import { TransactionListItemType, TransactionStatus } from '@safe-global/store/gateway/types'
import { TransactionItem } from '@safe-global/store/gateway/AUTO_GENERATED/transactions'

describe('TxGroupedCard', () => {
  it('should render the default markup', () => {
    const { getAllByTestId } = render(
      <TxGroupedCard
        transactions={[
          {
            ...mockListItemByType(TransactionListItemType.TRANSACTION),
            transaction: {
              id: 'id',
              timestamp: 123123,
              txStatus: TransactionStatus.SUCCESS,
              txInfo: mockERC20Transfer,
              txHash: '0x0000000',
            },
          } as TransactionItem,
          {
            ...mockListItemByType(TransactionListItemType.TRANSACTION),
            transaction: {
              id: 'id',
              timestamp: 123123,
              txStatus: TransactionStatus.SUCCESS,
              txInfo: mockNFTTransfer,
              txHash: '0x0000000',
            },
          } as TransactionItem,
        ]}
      />,
    )

    expect(getAllByTestId('tx-group-info')).toHaveLength(2)
  })

  it('should render a gropuped swap transaction', () => {
    const container = render(
      <TxGroupedCard
        transactions={[
          {
            type: 'TRANSACTION',
            transaction: {
              txInfo: mockSwapTransfer,
            },
            conflictType: 'None',
          } as TransactionItem,
        ]}
      />,
    )

    expect(container.getByText('Swap order settlement')).toBeTruthy()
  })
})
