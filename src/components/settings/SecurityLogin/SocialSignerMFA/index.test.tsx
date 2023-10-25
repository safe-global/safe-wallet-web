import { _getPasswordStrength, PasswordStrength } from '@/components/settings/SecurityLogin/SocialSignerMFA/index'

describe('_getPasswordStrength', () => {
  it('should return weak if the value has fewer than 9 characters', () => {
    const result = _getPasswordStrength('Testpw1!')

    expect(result).toEqual(PasswordStrength.weak)
  })

  it('should return weak if the value has no uppercase letter', () => {
    const result = _getPasswordStrength('testpassword1!')

    expect(result).toEqual(PasswordStrength.weak)
  })

  it('should return weak if the value has no number', () => {
    const result = _getPasswordStrength('Testpassword!')

    expect(result).toEqual(PasswordStrength.weak)
  })

  it('should return weak if the value has no special character', () => {
    const result = _getPasswordStrength('Testpassword123')

    expect(result).toEqual(PasswordStrength.weak)
  })

  it('should return weak if the value has 12 or more characters but no uppercase letter', () => {
    const result = _getPasswordStrength('testpassword123!')

    expect(result).toEqual(PasswordStrength.weak)
  })

  it('should return medium if the value has 9 or more characters, uppercase, number and special character', () => {
    const result = _getPasswordStrength('Testpw123!')

    expect(result).toEqual(PasswordStrength.medium)
  })

  it('should return strong if the value has 12 or more characters, uppercase, number and special character', () => {
    const result = _getPasswordStrength('Testpassword123!')

    expect(result).toEqual(PasswordStrength.strong)
  })
})
