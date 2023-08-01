import { markOpened, safeAppsSlice, setPinned } from '../safeAppsSlice'
import type { SafeAppsState } from '../safeAppsSlice'

describe('safeAppsSlice', () => {
  const safeAppId1 = 1
  const safeAppId2 = 2
  const safeAppId3 = 3

  describe('pinned', () => {
    it('sets pinned apps', () => {
      // Empty state
      const initialState1 = {} as unknown as SafeAppsState
      const state1 = safeAppsSlice.reducer(
        initialState1,
        setPinned({
          chainId: '1',
          pinned: [safeAppId1],
        }),
      )
      expect(state1).toStrictEqual({
        ['1']: {
          pinned: [safeAppId1],
        },
      })

      // State if only pinned existed
      const initialState2 = {
        '5': {
          pinned: [safeAppId1, safeAppId2],
        },
      } as unknown as SafeAppsState
      const state2 = safeAppsSlice.reducer(
        initialState2,
        setPinned({
          chainId: '5',
          pinned: [safeAppId3],
        }),
      )
      expect(state2).toStrictEqual({
        ['5']: {
          pinned: [safeAppId3],
        },
      })

      // State if only opened existed
      const initialState3 = {
        opened: [safeAppId1, safeAppId2],
      } as unknown as SafeAppsState
      const state3 = safeAppsSlice.reducer(
        initialState3,
        setPinned({
          chainId: '100',
          pinned: [safeAppId1, safeAppId2, safeAppId3],
        }),
      )
      expect(state3).toStrictEqual({
        ['100']: {
          pinned: [safeAppId1, safeAppId2, safeAppId3],
        },
        opened: [safeAppId1, safeAppId2],
      })
    })

    it('should not pin duplicates', () => {
      // Existing state
      const initialState = {
        '5': {
          pinned: [safeAppId1, safeAppId2],
        },
        opened: [],
      } as unknown as SafeAppsState
      const state = safeAppsSlice.reducer(
        initialState,
        setPinned({
          chainId: '5',
          pinned: [safeAppId1, safeAppId2],
        }),
      )
      expect(state).toStrictEqual({
        ['5']: {
          pinned: [safeAppId1, safeAppId2],
        },
        opened: [],
      })
    })
  })

  describe('opened', () => {
    it('marks an app open', () => {
      // Empty state
      const initialState1 = {} as unknown as SafeAppsState
      const state1 = safeAppsSlice.reducer(
        initialState1,
        markOpened({
          id: safeAppId1,
        }),
      )
      expect(state1).toStrictEqual({
        opened: [safeAppId1],
      })

      // State if only pinned existed
      const initialState2 = {
        '5': {
          pinned: [safeAppId1, safeAppId2],
        },
      } as unknown as SafeAppsState
      const state2 = safeAppsSlice.reducer(
        initialState2,
        markOpened({
          id: safeAppId2,
        }),
      )
      expect(state2).toStrictEqual({
        ['5']: {
          pinned: [safeAppId1, safeAppId2],
        },
        opened: [safeAppId2],
      })

      // State if only opened existed
      const initialState3 = {
        opened: [safeAppId1, safeAppId2],
      } as unknown as SafeAppsState
      const state3 = safeAppsSlice.reducer(
        initialState3,
        markOpened({
          id: safeAppId3,
        }),
      )
      expect(state3).toStrictEqual({
        opened: [safeAppId1, safeAppId2, safeAppId3],
      })
    })

    it('should not mark duplicates open', () => {
      // Existing state
      const initialState: SafeAppsState = {
        '5': {
          pinned: [safeAppId1, safeAppId2],
        },
        opened: [],
      } as unknown as SafeAppsState
      const state = safeAppsSlice.reducer(
        initialState,
        markOpened({
          id: safeAppId2,
        }),
      )
      expect(state).toStrictEqual({
        ['5']: {
          pinned: [safeAppId1, safeAppId2],
        },
        opened: [safeAppId2],
      })
    })
  })
})
