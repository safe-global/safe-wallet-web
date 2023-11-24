import { fireEvent, render, waitFor } from '@/tests/test-utils'
import CodeInput from '..'

const typeInFocusedElement = (text: string) => {
  let activeElement = document.activeElement! as HTMLInputElement
  activeElement.value = text
  fireEvent.input(activeElement, {
    currentTarget: {
      value: text,
    },
  })
}

describe('CodeInput', () => {
  it('should have empty initial state', () => {
    const onChanged = jest.fn()
    const result = render(<CodeInput length={4} onCodeChanged={onChanged} />)

    expect((result.getByTestId('digit-0') as HTMLInputElement).value).toBe('')
    expect((result.getByTestId('digit-1') as HTMLInputElement).value).toBe('')
    expect((result.getByTestId('digit-2') as HTMLInputElement).value).toBe('')
    expect((result.getByTestId('digit-3') as HTMLInputElement).value).toBe('')
  })

  it('should handle 4 valid inputs correctly and fire the onChange event', async () => {
    const onChanged = jest.fn()
    const result = render(<CodeInput length={4} onCodeChanged={onChanged} />)

    const firstDigitInput = result.getByTestId('digit-0')
    firstDigitInput.focus()
    typeInFocusedElement('1')
    typeInFocusedElement('2')
    typeInFocusedElement('3')
    typeInFocusedElement('4')

    await waitFor(() => {
      expect(onChanged).toHaveBeenCalledWith('1234')
    })
  })

  it('Deleting values automatically moves focus on previous element', async () => {
    const onChanged = jest.fn()
    const result = render(<CodeInput length={4} onCodeChanged={onChanged} />)

    const firstDigitInput = result.getByTestId('digit-0')
    firstDigitInput.focus()
    // Type 1234
    typeInFocusedElement('1')
    typeInFocusedElement('2')
    typeInFocusedElement('3')
    typeInFocusedElement('4')

    await waitFor(() => {
      // First 4 codes
      expect(onChanged).toHaveBeenCalledWith('1234')
    })

    // Simulate delete 2 times => moving focus on the second field
    typeInFocusedElement('')
    typeInFocusedElement('')

    // Type 111
    typeInFocusedElement('1')
    typeInFocusedElement('1')
    typeInFocusedElement('1')

    // Second validcode
    await waitFor(() => {
      expect(onChanged).toHaveBeenCalledWith('1111')
    })
  })

  it('Should not call onCodeChanged for invalid codes', async () => {
    const onChanged = jest.fn()
    const result = render(<CodeInput length={4} onCodeChanged={onChanged} />)

    const firstDigitInput = result.getByTestId('digit-0')
    firstDigitInput.focus()
    // Type AB12
    typeInFocusedElement('A')
    typeInFocusedElement('B')
    typeInFocusedElement('1')
    typeInFocusedElement('2')

    await waitFor(() => {
      expect(onChanged).not.toHaveBeenCalledWith('AB12')
      expect(onChanged).toHaveBeenCalledWith('')
    })
  })

  it('Should not call onCodeChanged for incomplete codes', async () => {
    const onChanged = jest.fn()
    const result = render(<CodeInput length={4} onCodeChanged={onChanged} />)

    const firstDigitInput = result.getByTestId('digit-0')
    firstDigitInput.focus()
    // Type 12
    typeInFocusedElement('1')
    typeInFocusedElement('2')

    await waitFor(() => {
      expect(onChanged).not.toHaveBeenCalledWith('12')
      expect(onChanged).toHaveBeenCalledWith('')
    })
  })

  it('should autofill if code is pasted into any input field', async () => {
    const onChanged = jest.fn()
    const result = render(<CodeInput length={4} onCodeChanged={onChanged} />)

    const secondDigitInput = result.getByTestId('digit-1')
    secondDigitInput.focus()

    fireEvent.paste(document.activeElement!, {
      clipboardData: {
        getData: () => '1234',
      },
    })

    await waitFor(() => {
      expect(onChanged).toHaveBeenCalledWith('1234')
    })
  })
})
