import { obfuscateNumber } from '../phoneNumber'

describe('phoneNumber', () => {
  it('should obfuscate numbers correctly', () => {
    expect(obfuscateNumber('+49170111222')).toEqual('+49*******22')
    expect(obfuscateNumber('0040123456')).toEqual('004*****56')
  })

  it('should return undefined if number is undefined', () => {
    expect(obfuscateNumber(undefined)).toBeUndefined()
  })
})
