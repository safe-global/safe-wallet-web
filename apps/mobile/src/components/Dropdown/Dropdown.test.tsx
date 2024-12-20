import { render, userEvent } from '@/src/tests/test-utils'
import { Dropdown } from '.'
import { Text, View } from 'tamagui'
import * as hooks from '@gorhom/bottom-sheet'

const mockedItems = ['Ethereum', 'Sepolia', 'Nevinha']

describe('Dropdown', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render the default markup', () => {
    const { getByText, queryByText, getByTestId } = render(
      <Dropdown
        label="Ethereum"
        dropdownTitle="Select network:"
        leftNode={<Text>Here is my leftNode</Text>}
        items={mockedItems}
        keyExtractor={({ item }) => item}
        renderItem={() => <View>It should not be rendered</View>}
      />,
    )

    expect(getByText('Ethereum')).toBeTruthy()
    expect(getByTestId('dropdown-arrow')).toBeTruthy()
    expect(getByText('Here is my leftNode')).toBeTruthy()
    expect(queryByText('It should not be rendered')).not.toBeTruthy()
  })

  it('should open and close the dropdown container', async () => {
    const user = userEvent.setup()
    const container = render(
      <Dropdown label="Ethereum" dropdownTitle="Select network:" leftNode={<Text>Here is my leftNode</Text>}>
        <Text>my custom child component</Text>
      </Dropdown>,
    )
    const dismissSpy = jest.fn()

    jest.spyOn(hooks, 'useBottomSheetModal').mockImplementation(() => ({ dismiss: dismissSpy, dismissAll: jest.fn() }))

    expect(container.queryByText('my custom child component')).not.toBeVisible()

    await user.press(container.getByTestId('dropdown-label-view'))

    expect(container.getByText('my custom child component')).toBeVisible()

    await user.press(container.getByTestId('dropdown-backdrop'))

    expect(dismissSpy).toHaveBeenCalled()
  })
})
