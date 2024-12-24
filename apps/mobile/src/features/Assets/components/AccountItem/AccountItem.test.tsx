import { render, userEvent } from '@/src/tests/test-utils'
import AccountItem from './AccountItem'
import { mockedActiveSafeInfo, mockedChains } from '@/src/store/constants'
import { Chain } from '@safe-global/store/gateway/AUTO_GENERATED/chains'
import { shortenAddress } from '@/src/utils/formatters'
import { Address } from '@/src/types/address'

describe('AccountItem', () => {
  it('should render a unselected AccountItem', () => {
    const container = render(
      <AccountItem
        account={mockedActiveSafeInfo}
        chains={mockedChains as unknown as Chain[]}
        activeAccount={'0x0123'}
        onSelect={jest.fn()}
      />,
    )

    expect(container.getByTestId('account-item-wrapper')).toHaveStyle({ backgroundColor: 'transparent' })
    expect(container.getByText(shortenAddress(mockedActiveSafeInfo.address.value))).toBeDefined()
    expect(container.getByText(`${mockedActiveSafeInfo.threshold}/${mockedActiveSafeInfo.owners.length}`)).toBeDefined()
    expect(container.getByText(`$${mockedActiveSafeInfo.fiatTotal}`)).toBeVisible()
    expect(container.getAllByTestId('chain-display')).toHaveLength(mockedChains.length)
  })

  it('should render a selected AccountItem', () => {
    const container = render(
      <AccountItem
        account={mockedActiveSafeInfo}
        chains={mockedChains as unknown as Chain[]}
        activeAccount={mockedActiveSafeInfo.address.value as Address}
        onSelect={jest.fn()}
      />,
    )

    expect(container.getByTestId('account-item-wrapper')).toHaveStyle({ backgroundColor: '#DCDEE0' })
    expect(container.getByText(shortenAddress(mockedActiveSafeInfo.address.value))).toBeDefined()
    expect(container.getByText(`${mockedActiveSafeInfo.threshold}/${mockedActiveSafeInfo.owners.length}`)).toBeDefined()
    expect(container.getByText(`$${mockedActiveSafeInfo.fiatTotal}`)).toBeVisible()
    expect(container.getAllByTestId('chain-display')).toHaveLength(mockedChains.length)
  })

  it('should trigger an event when user clicks in the account item', async () => {
    const spyFn = jest.fn()
    const user = userEvent.setup()
    const container = render(
      <AccountItem
        account={mockedActiveSafeInfo}
        chains={mockedChains as unknown as Chain[]}
        activeAccount={'0x123'}
        onSelect={spyFn}
      />,
    )

    await user.press(container.getByTestId('account-item-wrapper'))

    expect(spyFn).toHaveBeenNthCalledWith(1, mockedActiveSafeInfo.address.value)
  })
})
