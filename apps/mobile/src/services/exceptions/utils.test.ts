import { asError } from './utils'

describe('Exceptions Utils', () => {
  it('should throw an error from an Error instance', () => {
    const message = 'This is an error message'
    const errorFn = () => {
      throw asError(new Error(message))
    }

    expect(errorFn).toThrow(Error)
    expect(errorFn).toThrow(message)
  })

  it('should throw an Error from a json string', () => {
    const message = { myError: 'something', nested: { id: 1 } }
    const errorFn = () => {
      throw asError(message)
    }

    expect(errorFn).toThrow(Error)
    expect(errorFn).toThrow(JSON.stringify(message))
  })

  it('should throw an Error from a string', () => {
    const message = 'some error'
    const errorFn = () => {
      throw asError(message)
    }

    expect(errorFn).toThrow(Error)
    expect(errorFn).toThrow(message)
  })
})
