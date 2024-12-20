import { render } from '@/src/tests/test-utils'
import { SafeListItem } from '.'
import { Text, View } from 'tamagui'
import { ellipsis } from '@/src/utils/formatters'

describe('SafeListItem', () => {
  it('should render the default markup', () => {
    const { getByText } = render(
      <SafeListItem label="A label" leftNode={<Text>Left node</Text>} rightNode={<Text>Right node</Text>} />,
    )

    expect(getByText('A label')).toBeTruthy()
    expect(getByText('Left node')).toBeTruthy()
    expect(getByText('Right node')).toBeTruthy()
  })

  it('should render a list item, with type and icon', () => {
    const { getByText, getByTestId } = render(
      <SafeListItem
        label="A label"
        type="some type"
        icon="add-owner"
        leftNode={<Text>Left node</Text>}
        rightNode={<Text>Right node</Text>}
      />,
    )

    expect(getByText('A label')).toBeTruthy()
    expect(getByText('some type')).toBeTruthy()
    expect(getByTestId('safe-list-add-owner-icon')).toBeTruthy()
    expect(getByText('Left node')).toBeTruthy()
    expect(getByText('Right node')).toBeTruthy()
  })

  it('should render a list item with truncated label when the label text length is very long', () => {
    const text = 'A very long label text to test if it it will truncate, in this case it should truncate.'
    const { getByText, getByTestId } = render(
      <SafeListItem label={text} type="some type" icon="add-owner" leftNode={<Text>Left node</Text>} />,
    )

    expect(getByText(ellipsis(text, 30))).toBeTruthy()
    expect(getByText('some type')).toBeTruthy()
    expect(getByTestId('safe-list-add-owner-icon')).toBeTruthy()
    expect(getByText('Left node')).toBeTruthy()
  })

  it('should render a list item with a custom label template', () => {
    const container = render(
      <SafeListItem
        label={
          <View>
            <Text>Here is my label</Text>
          </View>
        }
        type="some type"
        icon="add-owner"
        leftNode={<Text>Left node</Text>}
      />,
    )

    expect(container.getByText('Here is my label')).toBeTruthy()
    expect(container.getByText('some type')).toBeTruthy()
    expect(container.getByTestId('safe-list-add-owner-icon')).toBeTruthy()
    expect(container.getByText('Left node')).toBeTruthy()

    expect(container).toMatchSnapshot()
  })
})

describe('SafeListItem.Header', () => {
  it('should render the default markup', () => {
    const { getByText } = render(<SafeListItem.Header title="any title for your header here" />)

    expect(getByText('any title for your header here')).toBeTruthy()
  })
})
