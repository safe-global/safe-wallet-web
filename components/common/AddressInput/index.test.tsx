import { render, act, fireEvent } from '@testing-library/react'
import { useForm, FormProvider } from 'react-hook-form'
import TestProviderWrapper from '@/mocks/TestProviderWrapper'
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

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => null)}>
        <AddressInput name={name} label="Recipient address" validate={validate} />
        <button type="submit">Submit</button>

        {<span data-testid="prefix">{methods.getValues(name).prefix}</span>}
        {<span data-testid="address">{methods.getValues(name).address}</span>}
      </form>
    </FormProvider>
  )
}

const setup = (address: string, prefix?: string, validate?: AddressInputProps['validate']) => {
  const utils = render(
    <TestProviderWrapper>
      <TestForm address={address} prefix={prefix} validate={validate} />
    </TestProviderWrapper>,
  )
  const input = utils.getByLabelText('Recipient address')
  return {
    input: input as HTMLInputElement,
    utils,
  }
}

describe('AddressInput tests', () => {
  it('should render with a default address value', () => {
    const { input } = setup('0x1234567890123456789012345678901234567890')
    expect(input.value).toBe('0x1234567890123456789012345678901234567890')
  })

  it('should render with a default prefixed address value', () => {
    const { input } = setup('0x1234567890123456789012345678901234567890', 'eth')
    expect(input.value).toBe('eth:0x1234567890123456789012345678901234567890')
  })

  it('should validate the address on input', async () => {
    const { input, utils } = setup('')

    fireEvent.change(input, { target: { value: 'xyz:0x1234567890123456789012345678901234567890' } })

    utils.getByText('Submit').click()
    await act(() => Promise.resolve())

    expect(utils.getByLabelText('Invalid chain prefix "xyz"')).toBeDefined()

    fireEvent.change(input, { target: { value: 'eth:0x1234567890123456789012345678901234567890' } })
    await act(() => Promise.resolve())

    expect(utils.getByLabelText(`"eth" doesn't match the current chain`)).toBeDefined()

    fireEvent.change(input, { target: { value: 'rin:0x123' } })
    await act(() => Promise.resolve())

    expect(utils.getByLabelText(`Invalid address format`)).toBeDefined()
  })

  it('should accept a custom validate function', async () => {
    const { input, utils } = setup('', undefined, (val) => `${val} is wrong`)

    fireEvent.change(input, { target: { value: 'rin:0x1234567890123456789012345678901234567890' } })

    utils.getByText('Submit').click()
    await act(() => Promise.resolve())

    expect(utils.getByLabelText('0x1234567890123456789012345678901234567890 is wrong')).toBeDefined()

    fireEvent.change(input, { target: { value: 'rin:0xa123456789012345678901234567890123456789' } })
    await act(() => Promise.resolve())

    expect(utils.getByLabelText('0xa123456789012345678901234567890123456789 is wrong')).toBeDefined()
  })

  it('should pass a parsed address on submit', async () => {
    const { input, utils } = setup('', undefined, (val) => `${val} is wrong`)

    fireEvent.change(input, { target: { value: 'eth:0x1234567890123456789012345678901234567890' } })

    utils.getByText('Submit').click()
    await act(() => Promise.resolve())

    expect(utils.getByTestId('prefix')).toHaveTextContent('eth')
    expect(utils.getByTestId('address')).toHaveTextContent('0x1234567890123456789012345678901234567890')

    fireEvent.change(input, { target: { value: 'rin:0xa123456789012345678901234567890123456789' } })
    await act(() => Promise.resolve())
    expect(utils.getByTestId('prefix')).toHaveTextContent('rin')
    expect(utils.getByTestId('address')).toHaveTextContent('0xa123456789012345678901234567890123456789')
  })
})
