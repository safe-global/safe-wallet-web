import { act, fireEvent } from '@testing-library/react'
import { render } from '@/tests/test-utils'
import { useForm, FormProvider } from 'react-hook-form'
import AddressInput, { type AddressInputProps } from '.'

// mock useCurrentChain
jest.mock('@/hooks/useChains', () => {
  return {
    useCurrentChain: jest.fn(() => ({
      shortName: 'rin',
      chainId: '4',
      chainName: 'Rinkeby',
    })),
  }
})

const TestForm = ({
  address,
  prefix,
  validate,
}: {
  address: string
  prefix?: string
  validate?: AddressInputProps['validate']
}) => {
  const name = 'recipient'

  const methods = useForm<{
    [name]: {
      address: string
      prefix?: string
      toString: () => string
    }
  }>({
    defaultValues: {
      [name]: {
        address,
        prefix,
        toString: () => (prefix ? `${prefix}:${address}` : address),
      },
    },
  })

  const addressValue = methods.watch(name)

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => null)}>
        <AddressInput name={name} label="Recipient address" validate={validate} />
        <button type="submit">Submit</button>

        {<span data-testid="prefix">{addressValue.prefix}</span>}
        {<span data-testid="address">{addressValue.address}</span>}
      </form>
    </FormProvider>
  )
}

const setup = (address: string, prefix?: string, validate?: AddressInputProps['validate']) => {
  const utils = render(<TestForm address={address} prefix={prefix} validate={validate} />)
  const input = utils.getByLabelText('Recipient address')
  return {
    input: input as HTMLInputElement,
    utils,
  }
}

const TEST_ADDRESS_A = '0x0000000000000000000000000000000000000000'
const TEST_ADDRESS_B = '0x0000000000000000000000000000000000000001'

describe('AddressInput tests', () => {
  it('should render with a default address value', () => {
    const { input } = setup(TEST_ADDRESS_A)
    expect(input.value).toBe(TEST_ADDRESS_A)
  })

  it('should render with a default prefixed address value', () => {
    const { input } = setup(TEST_ADDRESS_A, 'eth')
    expect(input.value).toBe(`eth:${TEST_ADDRESS_A}`)
  })

  it('should validate the address on input', async () => {
    const { input, utils } = setup('')

    fireEvent.change(input, { target: { value: `xyz:${TEST_ADDRESS_A}` } })

    utils.getByText('Submit').click()
    await act(() => Promise.resolve())

    expect(utils.getByLabelText('Invalid chain prefix "xyz"')).toBeDefined()

    fireEvent.change(input, { target: { value: `eth:${TEST_ADDRESS_A}` } })
    await act(() => Promise.resolve())

    expect(utils.getByLabelText(`"eth" doesn't match the current chain`)).toBeDefined()

    fireEvent.change(input, { target: { value: 'rin:0x123' } })
    await act(() => Promise.resolve())

    expect(utils.getByLabelText(`Invalid address format`)).toBeDefined()
  })

  it('should accept a custom validate function', async () => {
    const { input, utils } = setup('', undefined, (val) => `${val} is wrong`)

    fireEvent.change(input, { target: { value: `rin:${TEST_ADDRESS_A}` } })

    utils.getByText('Submit').click()
    await act(() => Promise.resolve())

    expect(utils.getByLabelText(`${TEST_ADDRESS_A} is wrong`)).toBeDefined()

    fireEvent.change(input, { target: { value: `rin:${TEST_ADDRESS_B}` } })
    await act(() => Promise.resolve())

    expect(utils.getByLabelText(`${TEST_ADDRESS_B} is wrong`)).toBeDefined()
  })

  it('should pass a parsed address on submit', async () => {
    const { input, utils } = setup('', undefined, (val) => `${val} is wrong`)

    fireEvent.change(input, { target: { value: `eth:${TEST_ADDRESS_A}` } })

    utils.getByText('Submit').click()
    await act(() => Promise.resolve())

    expect(utils.getByTestId('prefix')).toHaveTextContent('eth')
    expect(utils.getByTestId('address')).toHaveTextContent(TEST_ADDRESS_A)

    fireEvent.change(input, { target: { value: `rin:${TEST_ADDRESS_B}` } })
    await act(() => Promise.resolve())
    expect(utils.getByTestId('prefix')).toHaveTextContent('rin')
    expect(utils.getByTestId('address')).toHaveTextContent(TEST_ADDRESS_B)
  })
})
