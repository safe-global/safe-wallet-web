import { _extractSafesByChainId, _shouldExpandSafeList } from '..'

describe('SafeList', () => {
  describe('extractSafesByChainId', () => {
    it('returns owned Safes on provided chain', () => {
      const ownedSafes = {
        1: ['0x0', '0x1'],
        4: ['0x2', '0x3'],
      }

      expect(_extractSafesByChainId({ chainId: '4', ownedSafes, addedSafes: {} }).ownedSafesOnChain).toBe(ownedSafes[4])
    })
    it('returns an empty array if no owned Safes are on provided chain', () => {
      const ownedSafes = {
        1: ['0x0', '0x1'],
      }

      expect(_extractSafesByChainId({ chainId: '2', ownedSafes, addedSafes: {} }).ownedSafesOnChain).toStrictEqual([])
    })
    it('returns added Safes on provided chain', () => {
      const addedSafes = {
        1: {
          ['0x0']: {
            owners: [],
            threshold: 0,
          },
          ['0x1']: {
            owners: [],
            threshold: 0,
          },
        },
        4: {
          ['0x2']: {
            owners: [],
            threshold: 0,
          },
        },
      }

      expect(_extractSafesByChainId({ chainId: '1', ownedSafes: {}, addedSafes }).addedSafesOnChain).toBe(addedSafes[1])
    })
    it('returns an empty object if no added Safes are on provided chain', () => {
      const addedSafes = {
        1: {
          ['0x0']: {
            owners: [],
            threshold: 0,
          },
          ['0x1']: {
            owners: [],
            threshold: 0,
          },
        },
      }

      expect(_extractSafesByChainId({ chainId: '2', ownedSafes: {}, addedSafes }).addedSafesOnChain).toStrictEqual({})
    })
  })
  describe('shouldExpandSafeList', () => {
    it('should expand if the current Safe is not owned', () => {
      const safeAddress = '0x0'
      const ownedSafesOnChain = ['0x1']
      const addedSafesOnChain = {}

      expect(_shouldExpandSafeList({ isCurrentChain: true, safeAddress, ownedSafesOnChain, addedSafesOnChain })).toBe(
        true,
      )
    })
    it('should expand if the current Safe is owned but not added', () => {
      const safeAddress = '0x0'
      const ownedSafesOnChain = ['0x0']
      const addedSafesOnChain = {}

      _shouldExpandSafeList({ isCurrentChain: true, safeAddress, ownedSafesOnChain, addedSafesOnChain })
    })
    it("shouldn't expand if the current Safe is owned but added", () => {
      const safeAddress = '0x0'
      const ownedSafesOnChain = ['0x0']
      const addedSafesOnChain = {
        [safeAddress]: {
          owners: [],
          threshold: 1,
        },
      }

      _shouldExpandSafeList({ isCurrentChain: true, safeAddress, ownedSafesOnChain, addedSafesOnChain })
    })
    it('should expand if there are no added Safes and the owned number is less than the limit', () => {
      const safeAddress = '0x0'
      const ownedSafesOnChain = ['0x0']
      const addedSafesOnChain = {}

      _shouldExpandSafeList({ isCurrentChain: false, safeAddress, ownedSafesOnChain, addedSafesOnChain })
    })
    it("should't expand if there are no added Safes and the owned number is over the limit", () => {
      const safeAddress = '0x0'
      const ownedSafesOnChain = ['0x0', '0x1', '0x2', '0x3', '0x4', '0x5', '0x6', '0x7', '0x8', '0x9']
      const addedSafesOnChain = {}

      _shouldExpandSafeList({ isCurrentChain: false, safeAddress, ownedSafesOnChain, addedSafesOnChain })
    })
  })
})
