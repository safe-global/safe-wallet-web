import { _hydrationReducer } from '@/store'

describe('store', () => {
  describe('hydrationReducer', () => {
    it('should return a merged state', () => {
      const persistedState = {
        oldKey: 'newValue',
      }

      const initialState = {
        oldKey: 'oldValue',
        newKey: 'oldValue',
      }

      // @ts-expect-error demo state
      const mergedState = _hydrationReducer(initialState, {
        type: '@@HYDRATE',
        payload: persistedState,
      })

      expect(mergedState).toStrictEqual({
        oldKey: 'newValue',
        newKey: 'oldValue',
      })
    })

    it('should not replace the intial state', () => {
      const persistedState = {
        oldKey: 'newValue',
      }

      const initialState = {
        oldKey: 'oldValue',
        newKey: 'oldValue',
      }

      // @ts-expect-error demo state
      const mergedState = _hydrationReducer(initialState, {
        type: '@@HYDRATE',
        payload: persistedState,
      })

      expect(mergedState).not.toStrictEqual({
        oldKey: 'newValue',
      })
    })

    it('should not mutate the intial state', () => {
      const persistedState = {}

      const initialState = {}

      // @ts-expect-error demo state
      const mergedState = _hydrationReducer(initialState, {
        type: '@@HYDRATE',
        payload: persistedState,
      })

      // lodash' `merge` mutates the first argument
      expect(initialState === mergedState).toBeFalsy()
    })
  })
})
