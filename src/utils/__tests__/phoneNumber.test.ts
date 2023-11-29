import { obfuscateNumber } from '../phoneNumber'

describe('phoneNumber', () => {
  it('should obfuscate numbers correctly', () => {
    expect(obfuscateNumber('+49170111222')).toEqual('+49*******22')
    expect(obfuscateNumber('+40123456')).toEqual('+40****56')
  })

  it('should return undefined if number is undefined', () => {
    expect(obfuscateNumber(undefined)).toBeUndefined()
  })

  it('should keep whitespace', () => {
    expect(obfuscateNumber('+49 170 420 69')).toEqual('+49 *** *** 69')
  })
})
