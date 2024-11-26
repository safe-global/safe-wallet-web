import { render } from '@/src/tests/test-utils'
import TxSettingCard from '.'
import { mockTransferWithInfo } from '@/src/tests/mocks'
import { TransactionInfoType } from '@/src/store/gateway/types'
import { SettingsChangeTransaction } from '@/src/store/gateway/AUTO_GENERATED/transactions'

describe('TxSettingCard', () => {
  it('should render the default markup', () => {
    const container = render(
      <TxSettingCard
        txInfo={
          mockTransferWithInfo({
            type: TransactionInfoType.SETTINGS_CHANGE,
          }) as SettingsChangeTransaction
        }
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
