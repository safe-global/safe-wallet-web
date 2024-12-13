import { act, fireEvent, waitFor } from '@testing-library/react'
import { render } from '@/tests/test-utils'
import { useForm, FormProvider } from 'react-hook-form'
import AddressInput, { type AddressInputProps } from '.'
import { useCurrentChain } from '@/hooks/useChains'
import useNameResolver from '@/components/common/AddressInput/useNameResolver'
import { chainBuilder } from '@/tests/builders/chains'
import { FEATURES } from '@safe-global/safe-gateway-typescript-sdk'

const mockChain = chainBuilder()
  .with({ features: [FEATURES.DOMAIN_LOOKUP] })
  .build()

// mock useCurrentChain
jest.mock('@/hooks/useChains', () => ({
  useCurrentChain: jest.fn(() => mockChain),
}))

// mock useNameResolver
jest.mock('@/components/common/AddressInput/useNameResolver', () => ({
  __esModule: true,
  default: jest.fn((val: string) => ({
    address: val === 'zero.eth' ? '0x0000000000000000000000000000000000000000' : undefined,
    resolverError: val === 'bogus.eth' ? new Error('Failed to resolve') : undefined,
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
    mode: 'all',
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
  const input = utils.getByLabelText('Recipient address', { exact: false })

  return {
    input: input as HTMLInputElement,
    utils,
  }
}

const TEST_ADDRESS_A = '0x0000000000000000000000000000000000000000'
const TEST_ADDRESS_B = '0x0000000000000000000000000000000000000001'

describe('AddressInput tests', () => {
  beforeAll(() => {
    jest.useFakeTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  beforeEach(() => {
    jest.clearAllMocks()
    ;(useCurrentChain as jest.Mock).mockImplementation(() => mockChain)
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
      fireEvent.change(input, { target: { value: `eth:${TEST_ADDRESS_A}` } })
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() =>
      expect(utils.getByLabelText(`"eth" doesn't match the current chain`, { exact: false })).toBeDefined(),
    )

    // The validation error should persist on blur
    await act(async () => {
      fireEvent.blur(input)
      jest.advanceTimersByTime(1000)
      await Promise.resolve()
    })

    await waitFor(() =>
      expect(utils.getByLabelText(`"eth" doesn't match the current chain`, { exact: false })).toBeDefined(),
    )

    act(() => {
      fireEvent.change(input, { target: { value: `${mockChain.shortName}:0x123` } })
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => expect(utils.getByLabelText(`Invalid address format`, { exact: false })).toBeDefined())
  })

  it('should accept a custom validate function', async () => {
    const { input, utils } = setup('', (val) => `${val} is wrong`)

    act(() => {
      fireEvent.change(input, { target: { value: `${mockChain.shortName}:${TEST_ADDRESS_A}` } })
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => expect(utils.getByLabelText(`${TEST_ADDRESS_A} is wrong`, { exact: false })).toBeDefined())

    act(() => {
      fireEvent.change(input, { target: { value: `${mockChain.shortName}:${TEST_ADDRESS_B}` } })
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => expect(utils.getByLabelText(`${TEST_ADDRESS_B} is wrong`, { exact: false })).toBeDefined())
  })

  it('should show a spinner when validation is in progress', async () => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

    const { input, utils } = setup('', async (val) => {
      await sleep(2000)
      return `${val} is wrong`
    })

    act(() => {
      fireEvent.change(input, { target: { value: `${mockChain.shortName}:${TEST_ADDRESS_A}` } })
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => {
      expect(utils.getByRole('progressbar')).toBeDefined()
      expect(utils.queryByLabelText(`${TEST_ADDRESS_A} is wrong`, { exact: false })).toBeNull()
    })

    act(() => {
      jest.advanceTimersByTime(1000)
    })

    await waitFor(() => expect(utils.getByLabelText(`${TEST_ADDRESS_A} is wrong`, { exact: false })).toBeDefined())
  })

  it('should resolve ENS names', async () => {
    const { input } = setup('')

    act(() => {
      fireEvent.change(input, { target: { value: 'zero.eth' } })
    })

    await waitFor(() => expect(input.value).toBe('0x0000000000000000000000000000000000000000'))

    expect(useNameResolver).toHaveBeenCalledWith('zero.eth')
  })

  it('should show an error if ENS resolution has failed', async () => {
    const { input, utils } = setup('')

    act(() => {
      fireEvent.change(input, { target: { value: 'bogus.eth' } })
      jest.advanceTimersByTime(1000)
    })

    expect(useNameResolver).toHaveBeenCalledWith('bogus.eth')
    await waitFor(() => expect(utils.getByLabelText(`Failed to resolve`, { exact: false })).toBeDefined())
  })

  it('should not resolve ENS names if this feature is disabled', async () => {
    ;(useCurrentChain as jest.Mock).mockImplementation(() => ({
      shortName: 'gor',
      chainId: '5',
      chainName: 'Goerli',
      features: [],
    }))

    const { input, utils } = setup('')

    act(() => {
      fireEvent.change(input, { target: { value: 'zero.eth' } })
      jest.advanceTimersByTime(1000)
    })

    expect(useNameResolver).toHaveBeenCalledWith('')
    await waitFor(() => expect(input.value).toBe('zero.eth'))
    await waitFor(() => expect(utils.getByLabelText('Invalid address format', { exact: false })).toBeDefined())
  })

  it('should show chain prefix in an adornment', async () => {
    const { input } = setup(TEST_ADDRESS_A)

    await waitFor(() => expect(input.value).toBe(TEST_ADDRESS_A))

    expect(input.previousElementSibling?.textContent).toBe(`${mockChain.shortName}:`)
  })

  it('should not show the adornment prefix when the value contains correct prefix', async () => {
    const mockChain = chainBuilder().with({ features: [] }).build()
    ;(useCurrentChain as jest.Mock).mockImplementation(() => mockChain)

    const { input } = setup(`${mockChain.shortName}:${TEST_ADDRESS_A}`)

    await act(() => {
      fireEvent.change(input, { target: { value: `${mockChain.shortName}:${TEST_ADDRESS_B}` } })
      return Promise.resolve()
    })

    await waitFor(() => expect(input.previousElementSibling?.textContent).toBe(''))
  })

  it('should keep a bare address in the form state', async () => {
    let methods: any

    const Form = () => {
      const name = 'recipient'

      methods = useForm<{
        [name]: string
      }>({
        defaultValues: {
          [name]: '',
        },
      })

      return (
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(() => null)}>
            <AddressInput name={name} label="Recipient" />
          </form>
        </FormProvider>
      )
    }

    const utils = render(<Form />)
    const input = utils.getByLabelText('Recipient', { exact: false }) as HTMLInputElement

    act(() => {
      fireEvent.change(input, { target: { value: `${mockChain.shortName}:${TEST_ADDRESS_A}` } })
    })

    expect(methods.getValues().recipient).toBe(TEST_ADDRESS_A)
  })

  it('should clean up the input value if it contains a valid address', async () => {
    ;(useCurrentChain as jest.Mock).mockImplementation(() => ({
      shortName: 'gor',
      chainId: '5',
      chainName: 'Goerli',
      features: [],
    }))

    const { input } = setup(``)

    act(() => {
      fireEvent.change(input, { target: { value: `Here's my address: ${TEST_ADDRESS_A}` } })
    })

    await waitFor(() => expect(input.value).toBe(TEST_ADDRESS_A))
  })
})
