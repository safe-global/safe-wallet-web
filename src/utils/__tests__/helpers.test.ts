import { getKeyWithTrueValue } from '../helpers'
import { faker } from '@faker-js/faker'

describe('helpers', () => {
  describe('getKeyWithTrueValue', () => {
    const address1 = faker.finance.ethereumAddress()
    const address2 = faker.finance.ethereumAddress()
    const address3 = faker.finance.ethereumAddress()

    it('should return the address with value of true', async () => {
      const obj = {
        [address1]: false,
        [address2]: false,
        [address3]: true,
      }
      const result = getKeyWithTrueValue(obj)
      expect(result).toEqual(address3)
    })

    it('should return undefined when none of the objects properties are true', async () => {
      const obj = {
        [address1]: false,
        [address2]: false,
        [address3]: false,
      }
      const result = getKeyWithTrueValue(obj)
      expect(result).toEqual(undefined)
    })

    it('should return the first true value if there are more than one', async () => {
      const obj = {
        [address1]: true,
        [address2]: true,
        [address3]: true,
      }
      const result = getKeyWithTrueValue(obj)
      expect(result).toEqual(address1)
    })
  })
})
