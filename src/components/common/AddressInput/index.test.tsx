import { act, fireEvent, waitFor } from '@testing-library/react'
import { render } from '@/tests/test-utils'
import { useForm, FormProvider } from 'react-hook-form'
import AddressInput, { type AddressInputProps } from '.'
import { useCurrentChain } from '@/hooks/useChains'

// mock useCurrentChain
jest.mock('@/hooks/useChains', () => ({
  useCurrentChain: jest.fn(() => ({
    shortName: 'rin',
    chainId: '4',
    chainName: 'Rinkeby',
    features: ['DOMAIN_LOOKUP'],
  })),
}))

// mock useNameResolver
jest.mock('@/components/common/AddressInput/useNameResolver', () => ({
  __esModule: true,
  default: jest.fn((val) => ({
    address: val === 'zero.eth' ? '0x0000000000000000000000000000000000000000' : undefined,
    resolving: false,
  })),
}))

const TestForm = ({ address, validate }: { address: string; validate?: AddressInputProps['validate'] }) => {
  const name = 'recipient'

  const methods = useForm<{
    [name]: string
  }>({
    defaultValues: {
      [name]: address,
    },
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(() => null)}>
        <AddressInput name={name} label="Recipient address" validate={validate} />
        <button type="submit">Submit</button>
      </form>
    </FormProvider>
  )
}

const setup = (address: string, validate?: AddressInputProps['validate']) => {
  const utils = render(<TestForm address={address} validate={validate} />)
  const input = utils.getByLabelText('Recipient address')

  return {
    input: input as HTMLInputElement,
    utils,
  }
}

const TEST_ADDRESS_A = '0x0000000000000000000000000000000000000000'
const TEST_ADDRESS_B = '0x0000000000000000000000000000000000000001'

describe('AddressInput tests', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
  })

  it('should render with a default address value', () => {
    const { input } = setup(TEST_ADDRESS_A)
    expect(input.value).toBe(TEST_ADDRESS_A)
  })

  it('should render with a default prefixed address value', () => {
    const { input } = setup(`eth:${TEST_ADDRESS_A}`)
    expect(input.value).toBe(`eth:${TEST_ADDRESS_A}`)
  })

  it('should validate the address on input', async () => {
    const { input, utils } = setup('')

    act(() => {
      fireEvent.change(input, { target: { value: `xyz:${TEST_ADDRESS_A}` } })
      utils.getByText('Submit').click()
    })

    await waitFor(() => expect(utils.getByLabelText('Invalid chain prefix "xyz"')).toBeDefined())

    act(() => {
      fireEvent.change(input, { target: { value: `eth:${TEST_ADDRESS_A}` } })
    })

    await waitFor(() => expect(utils.getByLabelText(`"eth" doesn't match the current chain`)).toBeDefined())

    act(() => {
      fireEvent.change(input, { target: { value: 'rin:0x123' } })
    })

    await waitFor(() => expect(utils.getByLabelText(`Invalid address format`)).toBeDefined())
  })

  it('should accept a custom validate function', async () => {
    const { input, utils } = setup('', (val) => `${val} is wrong`)

    act(() => {
      fireEvent.change(input, { target: { value: `rin:${TEST_ADDRESS_A}` } })
      utils.getByText('Submit').click()
    })

    await waitFor(() => expect(utils.getByLabelText(`${TEST_ADDRESS_A} is wrong`)).toBeDefined())

    act(() => {
      fireEvent.change(input, { target: { value: `rin:${TEST_ADDRESS_B}` } })
    })

    await waitFor(() => expect(utils.getByLabelText(`${TEST_ADDRESS_B} is wrong`)).toBeDefined())
  })

  it('should resolve ENS names', async () => {
    const { input } = setup('')

    act(() => {
      fireEvent.change(input, { target: { value: 'zero.eth' } })
    })

    await waitFor(() => expect(input.value).toBe('0x0000000000000000000000000000000000000000'))
  })

  it('should not resolve ENS names if this feature is disabled', async () => {
    ;(useCurrentChain as jest.Mock).mockImplementation(() => ({
      shortName: 'rin',
      chainId: '4',
      chainName: 'Rinkeby',
      features: [],
    }))

    const { input } = setup('')

    act(() => {
      fireEvent.change(input, { target: { value: 'zero.eth' } })
    })

    await waitFor(() => expect(input.value).toBe('zero.eth'))
  })

  it('should keep a bare address in the form state', async () => {
    let methods: any

    const Form = ({ address }: { address: string }) => {
      const name = 'recipient'

      methods = useForm<{
        [name]: string
      }>({
        defaultValues: {
          [name]: address,
        },
      })

      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => null)}>
            <AddressInput name={name} label="Recipient address" />
          </form>
        </FormProvider>
      )
    }

    const utils = render(<Form address={TEST_ADDRESS_A} />)
    const input = utils.getByLabelText('Recipient address') as HTMLInputElement

    expect(methods.getValues().recipient).toBe(TEST_ADDRESS_A)
    expect(input.value).toBe(TEST_ADDRESS_A)
    expect(input.previousElementSibling?.textContent).toBe('rin:')

    act(() => {
      fireEvent.change(input, { target: { value: `rin:${TEST_ADDRESS_B}` } })
    })

    expect(methods.getValues().recipient).toBe(TEST_ADDRESS_B)
  })
})
